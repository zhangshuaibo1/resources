#!/usr/bin/env python3
"""Verify actual media files; never grant visual approval or activate appearances.

Standard library handles hashes, paths, SVG and GLB. Pillow is optional but needed
for complete raster decoding. Exit 0=technical checks passed, 2=failed, 3=partial.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import struct
import sys
import xml.etree.ElementTree as ET

try:
    from PIL import Image
except ImportError:
    Image=None

SKILL=Path(__file__).resolve().parents[1]

def safe_file(root,relative):
    if not isinstance(relative,str) or not relative or len(relative)>500:
        raise ValueError('file path must be a nonempty local relative path')
    rel=Path(relative)
    if rel.is_absolute() or '..' in rel.parts or '\\' in relative or ':' in relative:
        raise ValueError('file path must not be absolute, external or traversing')
    p=(root/rel).resolve()
    if not p.is_relative_to(root.resolve()) or not p.is_file():
        raise ValueError(f'file missing or outside the delivery root: {relative}')
    if p.stat().st_size==0:
        raise ValueError(f'empty file: {relative}')
    return p

def signature(raw):
    if raw.startswith(b'\x89PNG\r\n\x1a\n'): return 'png'
    if raw.startswith(b'\xff\xd8\xff'): return 'jpeg'
    if raw.startswith((b'GIF87a',b'GIF89a')): return 'gif'
    if raw[:4]==b'RIFF' and raw[8:12]==b'WEBP': return 'webp'
    if raw[:4]==b'glTF': return 'glb'
    if b'<svg' in raw[:2000]: return 'svg'
    raise ValueError('unsupported or unrecognized actual format')

def raster_info(path,fmt):
    if Image is None:
        return {'format':fmt,'decode_status':'not_executed_Pillow_unavailable','partial':True}
    with Image.open(path) as im:
        actual=im.format.lower()
        if actual=='jpg': actual='jpeg'
        if actual!=fmt:
            raise ValueError('decoder format differs from signature')
        width,height=im.size
        count=getattr(im,'n_frames',1)
        if width*height>16_777_216 or count>1000 or width*height*count>536_870_912:
            raise ValueError('media exceeds bounded validation canvas/frame/decode budget')
        durations=[]
        unique=set()
        alpha=False
        for frame in range(count):
            im.seek(frame)
            im.load()
            rgba=im.convert('RGBA')
            unique.add(hashlib.sha256(rgba.tobytes()).hexdigest())
            alpha=alpha or rgba.getchannel('A').getextrema()[0]<255
            durations.append(im.info.get('duration',0))
        result={'format':fmt,'width':width,'height':height,'frames':count,
                'unique_decoded_frames':len(unique),'duration_ms':sum(durations),
                'has_transparency':alpha,'decode_status':'all_frames_decoded','partial':False}
        if count>1:
            result['loop_metadata']=im.info.get('loop')
        return result

def svg_info(raw):
    source=raw.decode('utf-8-sig')
    if '<!DOCTYPE' in source.upper() or '<!ENTITY' in source.upper():
        raise ValueError('SVG entities/DOCTYPE are not accepted')
    root=ET.fromstring(source)
    if root.tag.split('}')[-1]!='svg':
        raise ValueError('document root is not SVG')
    animated=False
    for element in root.iter():
        tag=element.tag.split('}')[-1]
        if tag in ('script','foreignObject'):
            raise ValueError('SVG contains active embedded content')
        if tag in ('animate','animateTransform','animateMotion','set'):
            animated=True
        for key,value in element.attrib.items():
            short=key.split('}')[-1]
            if short.lower().startswith('on'):
                raise ValueError('SVG contains an event handler')
            if short=='href' and value and not value.startswith('#'):
                raise ValueError('SVG has external or embedded reference; use a self-contained vector')
        if tag=='style' and '@keyframes' in (element.text or ''):
            animated=True
    for found in re.findall(r'url\((.*?)\)',source,flags=re.I):
        if not found.strip(' \"\'').startswith('#'):
            raise ValueError('SVG CSS references an external resource')
    box=root.attrib.get('viewBox','').replace(',',' ').split()
    dimensions={}
    if len(box)==4:
        values=[float(x) for x in box]
        if values[2]<=0 or values[3]<=0: raise ValueError('invalid SVG viewBox')
        dimensions={'view_box':values,'width':values[2],'height':values[3]}
    return {'format':'svg',**dimensions,'animation_declared':animated,
            'decode_status':'XML_structure_checked','runtime_playback':'not_executed_by_script','partial':False}

def glb_info(raw):
    if len(raw)<28: raise ValueError('truncated GLB')
    magic,version,length=struct.unpack_from('<III',raw,0)
    if magic!=0x46546c67 or version!=2 or length!=len(raw):
        raise ValueError('invalid GLB v2 header or length')
    offset=12; chunks=[]
    while offset<len(raw):
        if offset+8>len(raw): raise ValueError('truncated GLB chunk header')
        size,kind=struct.unpack_from('<II',raw,offset)
        offset+=8
        if size%4 or offset+size>len(raw): raise ValueError('invalid GLB chunk range')
        chunks.append((kind,raw[offset:offset+size]));offset+=size
    if not chunks or chunks[0][0]!=0x4e4f534a:
        raise ValueError('GLB first chunk must be JSON')
    gltf=json.loads(chunks[0][1].decode('utf-8').rstrip(' \x00'))
    if gltf.get('asset',{}).get('version')!='2.0': raise ValueError('expected glTF 2.0')
    bins=[data for kind,data in chunks if kind==0x004e4942]
    if len(bins)!=1: raise ValueError('expected one embedded binary GLB buffer')
    buffers=gltf.get('buffers',[])
    if len(buffers)!=1 or 'uri' in buffers[0] or not 0<buffers[0].get('byteLength',0)<=len(bins[0]):
        raise ValueError('GLB must use a valid embedded buffer')
    for im in gltf.get('images',[]):
        if 'uri' in im: raise ValueError('GLB images must be embedded for portable delivery')
    views=gltf.get('bufferViews',[])
    for view in views:
        start=view.get('byteOffset',0);size=view.get('byteLength',0)
        if view.get('buffer',0)!=0 or start<0 or size<=0 or start+size>buffers[0]['byteLength']:
            raise ValueError('invalid GLB bufferView range')
    accessors=gltf.get('accessors',[])
    def accessor(index):
        if type(index) is not int or not 0<=index<len(accessors): raise ValueError('invalid accessor index')
        item=accessors[index]
        if item.get('count',0)<=0: raise ValueError('empty accessor')
        if 'bufferView' in item and not 0<=item['bufferView']<len(views): raise ValueError('invalid accessor bufferView')
        return item
    primitives=0;triangles=0;positions=0
    for mesh in gltf.get('meshes',[]):
        for primitive in mesh.get('primitives',[]):
            pos=accessor(primitive.get('attributes',{}).get('POSITION'))
            if pos.get('type')!='VEC3' or pos['count']<3: raise ValueError('mesh has no valid POSITION geometry')
            positions+=pos['count'];primitives+=1
            count=accessor(primitive['indices'])['count'] if 'indices' in primitive else pos['count']
            mode=primitive.get('mode',4)
            if mode==4:
                if count%3: raise ValueError('triangle primitive count is not divisible by 3')
                triangles+=count//3
            elif mode in (5,6): triangles+=max(count-2,0)
    if not primitives or not triangles: raise ValueError('no actual triangle geometry declared')
    clips=[]
    nodes=gltf.get('nodes',[])
    for index,animation in enumerate(gltf.get('animations',[])):
        samplers=animation.get('samplers',[]);channels=animation.get('channels',[])
        if not samplers or not channels: raise ValueError('empty animation')
        for channel in channels:
            si=channel.get('sampler');target=channel.get('target',{})
            if type(si) is not int or not 0<=si<len(samplers): raise ValueError('invalid animation sampler')
            if target.get('path') not in ('translation','rotation','scale','weights'): raise ValueError('invalid animation target')
            if type(target.get('node')) is not int or not 0<=target['node']<len(nodes): raise ValueError('invalid animation node')
            sampler=samplers[si]
            if accessor(sampler.get('input'))['count']<2: raise ValueError('animation requires more than one key')
            accessor(sampler.get('output'))
        clips.append(animation.get('name',f'unnamed-{index}'))
    return {'format':'glb','gltf_version':'2.0','meshes':len(gltf.get('meshes',[])),
            'primitives':primitives,'declared_position_count':positions,'triangles':triangles,
            'materials':len(gltf.get('materials',[])),'skins':len(gltf.get('skins',[])),
            'clips':clips,'decode_status':'container_and_geometry_animation_structure_checked',
            'draw_calls':'not_measured','runtime_playback':'not_executed_by_script',
            'visual_3d_likeness':'not_assessed','partial':False}

def inspect(path):
    raw=path.read_bytes();fmt=signature(raw)
    info={'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
    if fmt=='glb': info.update(glb_info(raw))
    elif fmt=='svg': info.update(svg_info(raw))
    else: info.update(raster_info(path,fmt))
    return info

def validate(manifest,root):
    if not isinstance(manifest,dict): raise ValueError('delivery manifest must be an object')
    if manifest.get('schema_version')!='9mew.visual-delivery.v1': raise ValueError('wrong delivery schema')
    for field in ('asset_id','asset_version','character_id','appearance_version','review_state'):
        if not isinstance(manifest.get(field),str) or not manifest[field]: raise ValueError(f'missing {field}')
    files=manifest.get('files',[])
    if not isinstance(files,list) or not files or len(files)>100: raise ValueError('files must contain 1..100 records')
    results=[];seen=set()
    for item in files:
        if not isinstance(item,dict): raise ValueError('file records must be objects')
        relative=item.get('path');errors=[]
        result={'path':relative}
        try:
            if relative in seen: raise ValueError('duplicate delivery path')
            seen.add(relative)
            path=safe_file(root,relative)
            facts=inspect(path);result.update(facts)
            expected=item.get('expected_format')
            if expected and expected!=facts['format']: errors.append('actual format differs from expected_format')
            expected_hash=item.get('sha256')
            if expected_hash and expected_hash!=facts['sha256']: errors.append('SHA-256 mismatch')
            if item.get('max_bytes') is not None:
                budget=item['max_bytes']
                if type(budget) is not int or budget<=0: raise ValueError('max_bytes must be a positive integer')
                if facts['bytes']>budget: errors.append('file exceeds its predeclared byte budget')
            kind=item.get('media_kind')
            if kind not in ('static','motion-poster','animation','character-animation-2d','model3d'): raise ValueError('unsupported media_kind')
            if kind=='model3d':
                errors.append('Current visual policy is 2D quality-first; 3D is deferred and is not a current delivery asset')
                if facts['format']!='glb': errors.append('model3d must be a real GLB')
                missing=set(item.get('expected_clips',[]))-set(facts.get('clips',[]))
                if missing: errors.append('missing actual clips: '+', '.join(sorted(missing)))
            elif facts['format']=='glb': errors.append('GLB cannot be labeled as a raster/static or frame animation')
            elif kind in ('animation','character-animation-2d','motion-poster'):
                if facts['format']=='svg':
                    if not facts.get('animation_declared'): errors.append('SVG has no declared animation')
                elif not facts.get('partial'):
                    if facts.get('frames',1)<max(2,item.get('expected_frames_min',2)): errors.append('actual frame count is insufficient')
                    if facts.get('unique_decoded_frames',1)<2: errors.append('no actual frame variation')
                    if facts.get('duration_ms',0)<=0: errors.append('animation duration is missing or zero')
                poster=safe_file(root,item.get('poster_path'))
                poster_facts=inspect(poster)
                if poster_facts['format']=='glb' or poster_facts.get('frames',1)>1 or poster_facts.get('animation_declared'):
                    errors.append('poster is not a static image')
                result['poster']={'path':item['poster_path'],**poster_facts}
                result['motion_classification']=kind
            elif facts.get('frames',1)>1 or facts.get('animation_declared'):
                errors.append('animated media mislabeled as static')
        except (ValueError,TypeError,KeyError,IndexError,OSError,ET.ParseError,struct.error) as exc:
            errors.append(str(exc))
        result['errors']=errors
        result['technical_status']='failed' if errors else ('partial' if result.get('partial') or result.get('poster',{}).get('partial') else 'passed')
        results.append(result)
    status='FAILED' if any(x['errors'] for x in results) else ('PARTIAL' if any(x['technical_status']=='partial' for x in results) else 'TECHNICAL_CHECKS_PASSED')
    return {'schema_version':'9mew.visual-validation.v1','asset_id':manifest['asset_id'],
            'asset_version':manifest['asset_version'],'status':status,'files':results,
            'declared_review_state':manifest['review_state'],'approval_verified':False,'appearance_activation':'not_executed',
            'visual_policy':'2d_quality_first.2; requested character actions required; static fallback is not motion completion; 3d_deferred',
            'scope':'File integrity, available complete raster decode and SVG structure. CSS/source playback requires separate browser evidence; legacy GLB parsing does not permit current 3D delivery.',
            'remaining':['Review actual likeness, anatomy, composition and style.','Verify 2D motion playback, pause/reduced-motion and target-device performance when applicable.',
                         'Obtain applicable visual/content review and authoritative activation; technical checks do not grant approval.']}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest',required=True,type=Path)
    parser.add_argument('--out',required=True,type=Path)
    args=parser.parse_args()
    try:
        out=args.out.resolve();source=args.manifest.resolve()
        if out.is_relative_to(SKILL) or out==source: raise ValueError('Write the report outside the skill and do not overwrite its manifest')
        manifest=json.loads(source.read_text(encoding='utf-8'))
        report=validate(manifest,source.parent)
        out.parent.mkdir(parents=True,exist_ok=True)
        out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        print(json.dumps({'status':report['status'],'files':len(report['files']),'report':str(out),'approval_verified':False},ensure_ascii=False))
        return 2 if report['status']=='FAILED' else (3 if report['status']=='PARTIAL' else 0)
    except (ValueError,TypeError,KeyError,OSError,json.JSONDecodeError) as exc:
        print(f'Visual delivery rejected: {exc}',file=sys.stderr)
        return 2

if __name__=='__main__':
    raise SystemExit(main())
