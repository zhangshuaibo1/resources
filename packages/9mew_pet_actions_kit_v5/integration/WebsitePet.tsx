'use client';

import {useEffect, useId, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent, PointerEvent} from 'react';
import {PlanarPetArt} from './PlanarPetArt';
import {PetActionPlayer, usePetActionCatalog} from './PetActionPlayer';
import type {AppearanceCatalog, AppearanceReference, AppearanceRegistryAdapter, AppearanceVariant, PetConversationConnection, PetTheme} from './website-pet-types';
import {publicPetAssetUrl, resolvePetAppearance} from './website-pet-types';
import './website-pet.css';

export interface WebsitePetProps {
  petId: string;
  catalog: AppearanceCatalog;
  /** Trusted root-relative location of this kit, e.g. /assets/9mew/. */
  baseUrl: string;
  appearanceRegistry?: AppearanceRegistryAdapter;
  /** Approved server-rendered reference, or an explicitly marked local prototype. */
  initialAppearance?: AppearanceReference;
  appearanceRefreshKey?: string | number;
  /** Off by default. Enable only in a clearly labeled local design preview. */
  allowPrototype?: boolean;
  conversation?: PetConversationConnection;
  theme?: PetTheme;
  reducedMotion?: boolean;
  name?: string;
  openSignal?: number;
}

type SelectedAppearance = {reference: AppearanceReference; variant: AppearanceVariant};
type Message = {id: string; role: 'user' | 'assistant'; text: string};
type Point = {x: number; y: number};
type Viewport = {left: number; top: number; width: number; height: number};

function viewport(): Viewport {
  const v = window.visualViewport;
  return {left: v?.offsetLeft || 0, top: v?.offsetTop || 0, width: v?.width || window.innerWidth, height: v?.height || window.innerHeight};
}
function clampPosition(point: Point, box: DOMRect, v: Viewport): Point {
  const gap = 12;
  return {x: Math.min(Math.max(point.x, v.left + gap), Math.max(v.left + gap, v.left + v.width - box.width - gap)), y: Math.min(Math.max(point.y, v.top + gap), Math.max(v.top + gap, v.top + v.height - box.height - gap))};
}
function DragDots() {
  return <svg viewBox="0 0 16 20" width="16" height="20" aria-hidden="true">{[5,11].flatMap(x => [4,10,16].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="currentColor"/>))}</svg>;
}

export function WebsitePet({petId, catalog, baseUrl, appearanceRegistry, initialAppearance, appearanceRefreshKey, allowPrototype = false, conversation, theme = 'light', reducedMotion = false, name = '奶喵', openSignal}: WebsitePetProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null), launcher = useRef<HTMLButtonElement>(null), heading = useRef<HTMLHeadingElement>(null);
  const request = useRef<AbortController | null>(null), requestSequence = useRef(0);
  const drag = useRef<{pointer: number; origin: Point; start: Point} | null>(null), corner = useRef(true), positionRef = useRef<Point>({x: 0, y: 0});
  const [position, setPosition] = useState<Point>({x: 0, y: 0}), [positioned, setPositioned] = useState(false), [viewHeight, setViewHeight] = useState(800);
  const [open, setOpen] = useState(false), [outsideEditing, setOutsideEditing] = useState(false), [systemReduced, setSystemReduced] = useState(true), [pageVisible, setPageVisible] = useState(true);
  const [appearance, setAppearance] = useState<SelectedAppearance | null>(null), [appearanceError, setAppearanceError] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [actionRequest, setActionRequest] = useState('blink'), [actionPlayKey, setActionPlayKey] = useState(0), [currentAction, setCurrentAction] = useState('blink');
  const actionCatalogUrl = `${baseUrl.replace(/\/$/, '')}/pet-actions/catalog.json`;
  const {catalog: actionCatalog} = usePetActionCatalog(actionCatalogUrl);
  const characterFrames = appearance?.variant.renderer === 'character-frames';
  const actionAppearance = characterFrames && appearance.reference.appearanceVersion === actionCatalog?.appearanceVersion;
  const availableActions = actionAppearance ? actionCatalog!.actions : [];
  function playAction(id: string) {if (!availableActions.some(item => item.id === id)) return;setActionRequest(id);setActionPlayKey(value => value + 1);}
  const [messages, setMessages] = useState<Message[]>([]), [draft, setDraft] = useState(''), [pending, setPending] = useState(false), [chatNotice, setChatNotice] = useState('');
  const conversationId = useRef<string | undefined>(undefined);
  const reduced = systemReduced || reducedMotion;
  const connected = conversation?.enabled === true && Boolean(conversation.adapter);

  let poster: string | undefined;
  if (appearance) {
    try {
      poster = publicPetAssetUrl(baseUrl, appearance.variant.referencePoster[theme], catalog);
    } catch { /* Bad app configuration cannot escape the packaged path allowlist. */ }
  }

  function updatePosition(next: Point) { positionRef.current = next; setPosition(next); }
  function place() {
    if (!root.current) return;
    const v = viewport(), box = root.current.getBoundingClientRect();
    setViewHeight(v.height);
    updatePosition(clampPosition(corner.current ? {x: v.left + v.width - box.width - 20, y: v.top + v.height - box.height - 20} : positionRef.current, box, v));
    setPositioned(true);
  }
  function stopWaiting() {
    requestSequence.current += 1;
    request.current?.abort(); request.current = null;
    setPending(false);
  }
  function closePanel(returnFocus = true) {
    if (request.current) setChatNotice('已停止等待这次回答。');
    stopWaiting(); setOpen(false);setActionRequest('blink');setActionPlayKey(value => value + 1);
    if (returnFocus) requestAnimationFrame(() => launcher.current?.focus());
  }
  function openPanel() { setOutsideEditing(false); setOpen(true);playAction('wave'); }

  useEffect(() => {
    const abort = new AbortController(); let alive = true;
    setAppearance(null); setAppearanceError(false);
    (async () => {
      try {
        const reference = appearanceRegistry ? await appearanceRegistry.readApproved({petId, signal: abort.signal}) : initialAppearance;
        if (!reference) throw new Error('Appearance registry is not connected.');
        const variant = resolvePetAppearance(catalog, reference, allowPrototype);
        if (alive && !abort.signal.aborted) setAppearance({reference, variant});
      } catch { if (alive && !abort.signal.aborted) setAppearanceError(true); }
    })();
    return () => {alive = false; abort.abort();};
  }, [petId, catalog, appearanceRegistry, initialAppearance, appearanceRefreshKey, allowPrototype]);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setSystemReduced(media.matches); motion(); media.addEventListener('change', motion);
    const visibility = () => setPageVisible(!document.hidden); visibility(); document.addEventListener('visibilitychange', visibility);
    const resize = () => place();
    window.addEventListener('resize', resize); window.visualViewport?.addEventListener('resize', resize); window.visualViewport?.addEventListener('scroll', resize);
    const observer = new ResizeObserver(resize); if (root.current) observer.observe(root.current);
    const focus = () => {
      const target = document.activeElement;
      const isEditing = target instanceof HTMLElement && target.matches('input,textarea,select,[contenteditable="true"]') && !root.current?.contains(target) && viewport().width <= 640;
      setOutsideEditing(Boolean(isEditing));
      if (isEditing) {if (request.current) {stopWaiting();setChatNotice('已停止等待这次回答。');}setOpen(false);}
    };
    const delayedFocus = () => queueMicrotask(focus);
    document.addEventListener('focusin', focus); document.addEventListener('focusout', delayedFocus);
    place();
    return () => {media.removeEventListener('change', motion);document.removeEventListener('visibilitychange', visibility);window.removeEventListener('resize', resize);window.visualViewport?.removeEventListener('resize', resize);window.visualViewport?.removeEventListener('scroll', resize);observer.disconnect();document.removeEventListener('focusin', focus);document.removeEventListener('focusout', delayedFocus);request.current?.abort();requestSequence.current += 1;};
  }, []);
  useEffect(() => {place(); if (open) heading.current?.focus({preventScroll: true});}, [open]);
  useEffect(() => {if (openSignal !== undefined && openSignal > 0) openPanel();}, [openSignal]);
  useEffect(() => {stopWaiting();setMessages([]);setDraft('');setChatNotice('');conversationId.current = undefined;}, [petId, conversation?.adapter, conversation?.enabled]);

  function dragStart(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || !root.current) return;
    corner.current = false;
    drag.current = {pointer: event.pointerId, origin: positionRef.current, start: {x: event.clientX, y: event.clientY}};
    event.currentTarget.setPointerCapture(event.pointerId); event.preventDefault();
  }
  function dragMove(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current || !root.current || drag.current.pointer !== event.pointerId) return;
    updatePosition(clampPosition({x: drag.current.origin.x + event.clientX - drag.current.start.x, y: drag.current.origin.y + event.clientY - drag.current.start.y}, root.current.getBoundingClientRect(), viewport()));
  }
  function dragEnd() {drag.current = null;}
  function dragKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Home') {event.preventDefault();corner.current = true;place();return;}
    const delta: Record<string, Point> = {ArrowLeft:{x:-12,y:0},ArrowRight:{x:12,y:0},ArrowUp:{x:0,y:-12},ArrowDown:{x:0,y:12}};
    if (!delta[event.key] || !root.current) return;
    event.preventDefault();corner.current = false;updatePosition(clampPosition({x:positionRef.current.x + delta[event.key].x,y:positionRef.current.y + delta[event.key].y},root.current.getBoundingClientRect(),viewport()));
  }
  async function submit() {
    const text = draft.trim();
    if (!connected || !conversation || !appearance || !text || pending || text.length > 1000) return;
    const abort = new AbortController(); request.current = abort;
    const sequence = ++requestSequence.current;
    const clientMessageId = crypto.randomUUID();
    setMessages(previous => [...previous, {id: clientMessageId, role: 'user', text}]);setDraft('');setPending(true);setChatNotice('');
    try {
      const answer = await conversation.adapter.ask({petId, conversationId: conversationId.current, clientMessageId, text, appearanceRevision: appearance.reference.revision, signal: abort.signal});
      if (abort.signal.aborted || sequence !== requestSequence.current) return;
      if (!answer.requestId || !answer.conversationId || typeof answer.text !== 'string' || !answer.text.trim() || answer.text.length > 16000) throw new Error('Invalid response.');
      conversationId.current = answer.conversationId;
      setMessages(previous => [...previous, {id: answer.requestId, role: 'assistant', text: answer.text}]);
    } catch {if (!abort.signal.aborted && sequence === requestSequence.current) setChatNotice('暂时没有收到回答，请稍后再试。');}
    finally {if (sequence === requestSequence.current) {setPending(false);request.current = null;}}
  }
  const dragProps = {onPointerDown: dragStart, onPointerMove: dragMove, onPointerUp: dragEnd, onPointerCancel: dragEnd, onLostPointerCapture: dragEnd, onKeyDown: dragKey};
  const style = {transform:`translate(${position.x}px, ${position.y}px)`, '--pet-viewport-height':`${viewHeight}px`, visibility: positioned && !outsideEditing ? 'visible' : 'hidden'} as CSSProperties;

  return <div ref={root} className={`website-pet ${open ? 'is-open' : ''}`} data-theme={theme} data-reduced-motion={reduced} data-pet-id={petId} style={style} onKeyDown={event => {if (event.key === 'Escape' && open) {event.stopPropagation();closePanel();}}}>
    {!open ? <div className="website-pet__dock">
      <button ref={launcher} type="button" className="website-pet__launcher" aria-label={`打开${name}，AI 宠物`} aria-expanded={false} aria-controls={`${id}-panel`} onClick={openPanel}>
        {poster ? characterFrames ? <PetActionPlayer catalogUrl={actionCatalogUrl} catalog={actionCatalog || undefined} expectedAppearanceVersion={appearance?.reference.appearanceVersion} fallbackSrc={poster} alt="" compact actionId="blink" paused={motionPaused || !pageVisible || outsideEditing} reducedMotion={reduced}/> : <PlanarPetArt src={poster} alt="" compact paused={motionPaused || !pageVisible || outsideEditing} reducedMotion={reduced}/> : <span className="website-pet__waiting">喵</span>}
        <span className="website-pet__name">{name}<span className="website-pet__dot"/></span>
      </button>
      <button type="button" className="website-pet__quiet" aria-label={motionPaused ? "继续宠物动作" : "暂停宠物动作"} aria-pressed={motionPaused} disabled={reduced} onClick={() => setMotionPaused(value => !value)}>{motionPaused ? "▷" : "Ⅱ"}</button>
      <button type="button" className="website-pet__drag website-pet__dock-drag" aria-label="移动宠物位置；方向键微调，Home 回到右下角" title="拖动位置" {...dragProps}><DragDots/></button>
    </div> : <section id={`${id}-panel`} className="website-pet__panel" role="dialog" aria-modal="false" aria-labelledby={`${id}-title`}>
      <header className="website-pet__header">
        <div><h2 ref={heading} tabIndex={-1} id={`${id}-title`}>{name}<span>AI 宠物</span></h2><p>{connected ? '陪你想一想，一起往前走。' : '交互演示 · 问答尚未连接'}</p></div>
        <div className="website-pet__header-actions"><button type="button" className="website-pet__drag" aria-label="移动宠物面板；方向键微调，Home 回到右下角" title="拖动位置" {...dragProps}><DragDots/></button><button type="button" className="website-pet__icon-button" aria-label="收起奶喵" onClick={() => closePanel()}><svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg></button></div>
      </header>
      <div className="website-pet__scroll">
        <div className="website-pet__stage">
          {poster && (characterFrames ? <PetActionPlayer catalogUrl={actionCatalogUrl} catalog={actionCatalog || undefined} expectedAppearanceVersion={appearance?.reference.appearanceVersion} fallbackSrc={poster} alt={`${name}的奶油色小猫形象，佩戴樱花粉围巾`} actionId={actionRequest} playKey={actionPlayKey} onActionChange={setCurrentAction} paused={motionPaused || !pageVisible || outsideEditing} reducedMotion={reduced}/> : <PlanarPetArt src={poster} alt={`${name}的奶油色小猫形象，佩戴樱花粉围巾`} paused={motionPaused || !pageVisible || outsideEditing} reducedMotion={reduced}/>)} 
          {allowPrototype && <span className="website-pet__preview-badge">外观预览</span>}
          {!poster && <span className="website-pet__stage-notice">{appearanceError ? '外观暂不可用' : '奶喵正在过来'}</span>}
        </div>
        <p className="website-pet__state" aria-live="polite">{reduced ? '已减少动态，静静陪着你。' : motionPaused ? '安静一下，也很好。' : actionAppearance ? `奶喵 · ${availableActions.find(item => item.id === currentAction)?.label || '静静陪伴'}` : '一点星光，一点陪伴。'}</p>
        <div className="website-pet__motions" aria-label="宠物动作设置"><button type="button" disabled={reduced} aria-pressed={motionPaused} onClick={() => setMotionPaused(value => !value)}>{motionPaused ? '继续动作' : '暂停动作'}</button>{availableActions.length > 0 && <div className="website-pet__action-picker" role="group" aria-label="选择奶喵动作"><select aria-label="选择奶喵动作" value={currentAction} disabled={reduced} onChange={event => playAction(event.target.value)}>{availableActions.map(action => <option value={action.id} key={action.id}>{action.label}</option>)}</select><button type="button" disabled={reduced} onClick={() => playAction(actionRequest)} aria-label={`重播${availableActions.find(item => item.id === actionRequest)?.label || '上一个动作'}`}>重播{availableActions.find(item => item.id === actionRequest)?.label || '上一个动作'}</button></div>}</div>
        {messages.length > 0 && <div className="website-pet__messages" role="log" aria-live="polite" aria-label="与奶喵的对话">{messages.map(message => <p key={message.id} className={`website-pet__message is-${message.role}`}><span>{message.role === 'user' ? '你' : name}</span>{message.text}</p>)}</div>}
        <form className="website-pet__composer" onSubmit={event => {event.preventDefault();void submit();}}>
          <label className="website-pet__sr-only" htmlFor={`${id}-message`}>告诉{name}你的想法</label>
          <textarea id={`${id}-message`} maxLength={1000} rows={2} value={draft} disabled={!connected || pending} onChange={event => setDraft(event.target.value)} placeholder={connected ? '今天，想和奶喵聊些什么？' : '接入问答服务后，就可以和奶喵聊天。'}/>
          <div className="website-pet__composer-footer"><span>{connected ? '回复由 AI 生成' : '动作预览 · 问答尚未连接'}</span>{pending ? <button type="button" onClick={() => {stopWaiting();setChatNotice('已停止等待这次回答。');}}>停止等待</button> : <button type="submit" disabled={!connected || !draft.trim() || !appearance}>发送</button>}</div>
        </form>
        {chatNotice && <p className="website-pet__chat-notice" role="status">{chatNotice}</p>}
      </div>
    </section>}
  </div>;
}
