#!/usr/bin/env python3
"""Build an offline, provider-neutral visual job. Never invokes an API or activates a pet."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

SKILL = Path(__file__).resolve().parents[1]
TASKS = {'create-character','edit-appearance','evolve-appearance','scene','theme','character-sheet','motion-keyframes','character-animation','website-pet','motion-poster','model3d-brief'}
CHANGES = {'pose','expression','accessories','coat_color','coat_pattern','aura','lighting','environment','silhouette','mythic_anatomy'}
BRANCHES = {'natural','astral','mist','aether','cultivation','mythic'}
ROLES = {'identity','edit-target','style-only','style-and-composition','composition'}
THEMES = {'light','dark','transparent'}

def load_json(path):
    return json.loads(path.read_text(encoding='utf-8'))

def text(value, name, minimum=1, maximum=4000):
    if not isinstance(value,str) or not minimum <= len(value) <= maximum:
        raise ValueError(f'{name} must be a string with {minimum}..{maximum} characters')
    return value

def identifier(value,name):
    value=text(value,name,1,160)
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]*',value):
        raise ValueError(f'{name} contains unsupported characters')
    return value

def contained(root,relative):
    text(relative,'reference path',1,500)
    rel=Path(relative)
    if rel.is_absolute() or '..' in rel.parts or '\\' in relative or ':' in relative:
        raise ValueError('References must be local relative paths without traversal or URL schemes')
    path=(root/rel).resolve()
    if not path.is_relative_to(root.resolve()) or not path.is_file():
        raise ValueError(f'Reference is missing or outside its allowed root: {relative}')
    return path

def reference(root,relative,role,expected=None):
    if role not in ROLES:
        raise ValueError(f'Unsupported reference role: {role}')
    path=contained(root,relative)
    raw=path.read_bytes()
    if not raw:
        raise ValueError(f'Empty reference: {relative}')
    digest=hashlib.sha256(raw).hexdigest()
    if expected and expected!=digest:
        raise ValueError(f'Reference hash mismatch: {relative}')
    return {'local_path':str(path),'relative_path':relative,'role':role,
            'sha256':digest,'bytes':len(raw),'view_required':True,
            'transmission_permission':'must be established by the calling environment'}

def build(request,reference_root):
    if not isinstance(request,dict):
        raise ValueError('Request must be a JSON object')
    if request.get('schema_version')!='9mew.visual-request.v1':
        raise ValueError('Expected schema_version=9mew.visual-request.v1')
    job_id=identifier(request.get('job_id'),'job_id')
    task=request.get('task')
    if task not in TASKS:
        raise ValueError('Unsupported task')
    identity=load_json(SKILL/'assets/identity.json')
    identity_mode=request.get('identity_mode','preserve')
    if identity_mode not in ('preserve','new-character'):
        raise ValueError('identity_mode must be preserve or new-character')
    character_id=identifier(request.get('character_id',identity['character_id']),'character_id')
    if identity_mode=='new-character' and character_id==identity['character_id']:
        raise ValueError('A new individual requires a new character_id')
    if identity_mode=='preserve' and character_id!=identity['character_id']:
        custom_identity=request.get('additional_references',[])
        if not isinstance(custom_identity,list) or any(not isinstance(r,dict) for r in custom_identity):
            raise ValueError('additional_references must be a list of reference objects')
        if not any(r.get('role') in ('identity','edit-target') for r in custom_identity):
            raise ValueError('Preserving another character requires its actual identity/edit-target reference')
    branch=request.get('branch','natural')
    if branch not in BRANCHES:
        raise ValueError('Unsupported branch; extend the versioned art-direction vocabulary deliberately')
    brief=text(request.get('brief'),'brief',1,6000)
    allowed=request.get('allowed_changes',[])
    changes=request.get('changes',{})
    if not isinstance(allowed,list) or any(x not in CHANGES for x in allowed) or len(allowed)!=len(set(allowed)):
        raise ValueError('allowed_changes must contain unique supported change keys')
    if not isinstance(changes,dict) or not set(changes).issubset(allowed):
        raise ValueError('Every requested change must be listed in allowed_changes')
    for k,v in changes.items():
        text(v,'changes.'+k)
    if branch=='natural' and 'mythic_anatomy' in allowed:
        raise ValueError('Natural-cat branch cannot implicitly add mythic anatomy')
    if task in ('edit-appearance','evolve-appearance') and not changes:
        raise ValueError('An appearance edit requires an explicit change scope')

    target=request.get('target',{})
    if not isinstance(target,dict):
        raise ValueError('target must be an object')
    asset_id=identifier(target.get('asset_id'),'target.asset_id')
    version=identifier(target.get('asset_version'),'target.asset_version')
    kind=target.get('media_kind','static')
    if kind not in ('static','motion-poster','animation','character-animation-2d','model3d','keyframe-reference'):
        raise ValueError('Unsupported target.media_kind')
    if task=='model3d-brief' and kind!='model3d':
        raise ValueError('A model3d brief must target actual model3d output')
    if task=='motion-keyframes' and kind!='keyframe-reference':
        raise ValueError('Keyframe references must not be labeled as final animation')
    if task=='motion-poster' and kind!='motion-poster':
        raise ValueError('A motion-poster task must declare its actual planar composition type')
    if task=='character-animation' and kind not in ('animation','character-animation-2d'):
        raise ValueError('A character-animation task must target actual character animation')
    animation=None
    if task=='character-animation':
        animation=request.get('animation')
        if not isinstance(animation,dict):
            raise ValueError('A character-animation request requires an animation object')
        identifier(animation.get('action_id'),'animation.action_id')
        text(animation.get('category'),'animation.category',1,80)
        phases=animation.get('phases')
        if not isinstance(phases,list) or not 2<=len(phases)<=32:
            raise ValueError('animation.phases must contain 2..32 successive pose descriptions')
        for i,phase in enumerate(phases): text(phase,f'animation.phases[{i}]',1,800)
        columns=animation.get('columns',4);rows=animation.get('rows',2)
        if type(columns) is not int or type(rows) is not int or not 1<=columns<=8 or not 1<=rows<=8 or columns*rows!=len(phases):
            raise ValueError('animation grid must match the exact phase count')
        if animation.get('playback') not in ('once','loop'):
            raise ValueError('animation.playback must be once or loop')
        duration=animation.get('duration_ms')
        if type(duration) is not int or not 250<=duration<=30000:
            raise ValueError('animation.duration_ms must be an integer in 250..30000')
        text(animation.get('start_pose'),'animation.start_pose',1,800)
        text(animation.get('end_pose'),'animation.end_pose',1,800)
        text(animation.get('camera'),'animation.camera',1,800)
        text(animation.get('anchor_policy'),'animation.anchor_policy',1,800)
        animation={**animation,'columns':columns,'rows':rows,'key_pose_count':len(phases)}
    themes=target.get('themes',['transparent'])
    if not isinstance(themes,list) or not themes or not set(themes).issubset(THEMES):
        raise ValueError('Invalid target.themes')
    ratio=text(target.get('aspect_ratio','1:1'),'target.aspect_ratio',3,12)
    if not re.fullmatch(r'[1-9][0-9]?:[1-9][0-9]?',ratio):
        raise ValueError('aspect_ratio must be a requested ratio such as 1:1 or 3:2')
    placement=text(target.get('placement'),'target.placement',1,800)
    clips=target.get('required_clips',[])
    if not isinstance(clips,list) or any(not isinstance(x,str) or not x for x in clips):
        raise ValueError('required_clips must be a list of actual desired clip names')
    limits=request.get('limits',{})
    if not isinstance(limits,dict):
        raise ValueError('limits must be an object')
    candidates=limits.get('max_candidates',1)
    attempts=limits.get('max_attempts',2)
    if type(candidates) is not int or not 1<=candidates<=12:
        raise ValueError('max_candidates must be an integer in 1..12')
    if type(attempts) is not int or not 1<=attempts<=10:
        raise ValueError('max_attempts must be an integer in 1..10')

    refs=[]
    master=identity['references'][0]
    main_identity=identity_mode=='preserve' and character_id==identity['character_id']
    refs.append(reference(SKILL,master['path'],'identity' if main_identity else 'style-only',master['sha256']))
    extras=request.get('additional_references',[])
    if not isinstance(extras,list) or len(extras)>5:
        raise ValueError('Use at most five deliberate additional references')
    for item in extras:
        if not isinstance(item,dict):
            raise ValueError('Each additional reference must be an object')
        refs.append(reference(reference_root,item.get('path'),item.get('role'),item.get('sha256')))
    proof=request.get('proof_mode','concept_only')
    if proof not in ('concept_only','event_linked'):
        raise ValueError('Invalid proof_mode')
    event=request.get('event_ref')
    if proof=='event_linked':
        identifier(event,'event_ref')
    elif event is not None:
        raise ValueError('concept_only jobs do not claim a real event_ref')
    appearance=None
    if task in ('edit-appearance','evolve-appearance'):
        parent=identifier(request.get('base_appearance_version'),'base_appearance_version')
        next_version=identifier(request.get('appearance_version'),'appearance_version')
        if parent==next_version:
            raise ValueError('Save appearance changes as a new version')
        appearance={'character_id':character_id,'parent_appearance_version':parent,
                    'candidate_appearance_version':next_version,'state':'candidate',
                    'proof_mode':proof,'event_ref':event,'branch':branch,
                    'allowed_changes':allowed,'changes':changes,
                    'activation':'not executed; owning service must verify event, identity, version, audience and approval'}

    visual_policy=identity.get('visual_policy',{})
    if kind=='model3d' or task=='model3d-brief':
        # Preserve legacy request compatibility without launching a deferred route.
        message=('3D is deferred by the current user-selected 2D quality-first policy. '
                 'Use the selected original as a static image or a labeled planar motion-poster. '
                 'Do not call a 3D provider, reconstruct a mesh, or treat the absence of GLB as a current delivery blocker.')
        return {'schema_version':'9mew.visual-job.v1','job_id':job_id,'task':task,
                'execution_status':'deferred_by_visual_policy','character_id':character_id,
                'requested_target':{**target,'asset_id':asset_id,'asset_version':version,'media_kind':kind},
                'target':{'asset_id':asset_id,'asset_version':version,'media_kind':'static','themes':themes,
                          'placement':placement,'state':'suggested_2d_alternative_only'},
                'prompt':message,'prompt_sha256':hashlib.sha256(message.encode()).hexdigest(),
                'references':refs,'appearance_candidate':None,'visual_policy':visual_policy,
                'execution_route':None,'provider_execution':{'provider':None,'model':None,'model_version':None,
                    'actual_parameters':{},'actual_cost':None,'provider_job_id':None},
                'limits':{'max_candidates':0,'max_attempts':0},
                'current_delivery_blocked':False,'future_3d_requirements':visual_policy.get('future_3d_requirements',[]),
                'handoff':['Continue current authorized 2D work.','Keep stable character/appearance IDs with a replaceable renderer.',
                           'Revisit 3D only after a deliberate future scope change and verified capable tools.']}

    identity_line='; '.join(identity['identity_features']) if main_identity else (
        'Use the selected main kitten for material/lighting/style only, not its exact face or white coat. '+
        text(request.get('character_brief',brief),'character_brief',1,6000))
    sections=[f'Asset type: {kind}. Placement: {placement}.',
              f'Primary request: {brief}',
              f'Identity mode: {identity_mode}. Identity: {identity_line}',
              f'Creative branch: {branch}; celestial universe, cultivation, mythology and fantasy are valid when requested.',
              'Allowed changes: '+ ('; '.join(k+': '+changes[k] for k in allowed if k in changes) or 'Only the explicitly requested scene/pose; preserve the character.'),
              'Style: refined high-quality 2D illustration matching the original tactile fur and volumetric lighting; elegant feline poses, satin/pearl/linen props, coherent contact and generous margins. Volumetric shading does not require 3D geometry.',
              'Palette: cream #FFF5EC, sakura #F6A9C2, mint #BDE2D3; midnight #101321/#171C35 for dark scenes. Approved project tokens take precedence.',
              f'Requested framing: {ratio}. Themes: {", ".join(themes)}. Map these intentions only to provider-supported controls.',
              'Constraints: no text, guessed logo, fake interface, numeric claims, human hands, unintended extra limbs/tails or cropped ears/paws. Preserve readable iris eyes and face identity.',
              'Fantasy anatomy may change only where explicitly listed; keep count, attachment and silhouette deliberate.']
    sections.append('Quality priority: preserve the selected original face and fur. Correct failed character motion rather than promoting inferior art. The unchanged original is a runtime fallback, not completion of requested actions. Current delivery is 2D; future 3D is deferred and not a completion requirement.')
    if 'transparent' in themes:
        sections.append('Deliver actual alpha if the chosen capability supports it; never draw a checkerboard or opaque backdrop and call it transparent.')
    if kind=='motion-poster':
        sections.append('Deliver a planar motion-poster: preserve the reference image bytes and facial/body anatomy; use restrained whole-image translation/rotation and sparse separate decorative layers. Do not fake blinking, paw articulation or 3D rotation. Include source, pause/reduced-motion/offscreen handling and the unchanged static fallback; verify CSS/SVG playback in the actual browser.')
    elif kind in ('animation','character-animation-2d'):
        sections.append('The final deliverable must be actual character animation with a verified frame timeline, loop/once behavior and a static poster. An image-generation sheet is source art only; assemble and encode it afterwards. Do not relabel a pan/zoom still as character animation.')
        if animation:
            phases='; '.join(f'{i+1}: {phase}' for i,phase in enumerate(animation['phases']))
            sections.append(f"This source-art step: create one transparent sprite sheet, {animation['columns']} equal columns by {animation['rows']} equal rows, reading left to right then top to bottom. Single action: {animation['action_id']}. Phases: {phases}")
            sections.append(f"Start pose: {animation['start_pose']}. End pose: {animation['end_pose']}. Camera: {animation['camera']}. Anchor policy: {animation['anchor_policy']}. Keep the complete cat inside every cell, consistent scale and fur, no lines/labels/background/shadow, no overlaps between cells. The requested action may change the reference sitting pose while preserving the same character anatomy.")
    elif kind=='keyframe-reference':
        sections.append('Deliver clearly labeled preproduction key poses, not a claim that a final animation exists.')
    prompt='\n\n'.join(sections)
    return {'schema_version':'9mew.visual-job.v1','job_id':job_id,'task':task,
            'execution_status':'prepared_only','character_id':character_id,
            'visual_policy':visual_policy,'renderer_family':'2d',
            'target':{**target,'asset_id':asset_id,'asset_version':version,'media_kind':kind,'themes':themes},
            'prompt':prompt,'prompt_sha256':hashlib.sha256(prompt.encode()).hexdigest(),
            'references':refs,'appearance_candidate':appearance,
            'animation_plan':animation,
            'final_delivery_requirements':(['actual pose frames and source sheet','per-frame timing and loop/once policy','decoded animated export and original poster','actual visual and browser playback evidence','separate source/derivative counts; no production activation'] if animation else []),
            'local_audit_only':{'proof_mode':proof,'event_ref':event,'authorization_ref':request.get('authorization_ref'),
                               'permission_verification':'not performed by this offline builder'},
            'limits':{'max_candidates':candidates,'max_attempts':attempts},
            'provider_execution':{'provider':None,'model':None,'model_version':None,'actual_parameters':{},'actual_cost':None,'provider_job_id':None},
            'handoff':['View references before generation.','Check actual provider capability and existing valid authorization.',
                       'Keep local audit fields out of the provider prompt.','Save outputs as candidates and inspect actual files.',
                       'Do not activate appearances, change model tiers, balances, progression or permissions.']}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--request',required=True,type=Path)
    parser.add_argument('--out',required=True,type=Path)
    parser.add_argument('--reference-root',type=Path,default=SKILL)
    args=parser.parse_args()
    try:
        out=args.out.resolve()
        if out.is_relative_to(SKILL):
            raise ValueError('Keep generated jobs outside the installed skill')
        if out==args.request.resolve():
            raise ValueError('Do not overwrite the input request')
        job=build(load_json(args.request),args.reference_root.resolve())
        out.parent.mkdir(parents=True,exist_ok=True)
        out.write_text(json.dumps(job,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        print(json.dumps({'job_id':job['job_id'],'status':job['execution_status'],'output':str(out),'references':len(job['references'])},ensure_ascii=False))
    except (ValueError,TypeError,KeyError,OSError,json.JSONDecodeError) as exc:
        print(f'Visual job rejected: {exc}',file=sys.stderr)
        return 2
    return 0

if __name__=='__main__':
    raise SystemExit(main())
