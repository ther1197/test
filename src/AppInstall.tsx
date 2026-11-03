import { useEffect, useRef, useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function AppInstall() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [help, setHelp] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [registrationFailed, setRegistrationFailed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const { offlineReady: [offlineReady], needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegisterError: () => setRegistrationFailed(true),
  });

  useEffect(() => {
    const query = matchMedia('(display-mode: standalone)');
    const check = () => setInstalled(query.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const offer = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const done = () => { setInstalled(true); setPrompt(null); setHelp(false); };
    check();
    query.addEventListener('change', check);
    window.addEventListener('beforeinstallprompt', offer);
    window.addEventListener('appinstalled', done);
    return () => {
      query.removeEventListener('change', check);
      window.removeEventListener('beforeinstallprompt', offer);
      window.removeEventListener('appinstalled', done);
    };
  }, []);

  useEffect(() => { if (help) dialog.current?.showModal(); }, [help]);
  const install = async () => {
    if (!prompt) { setHelp(true); return; }
    setBusy(true);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') setInstalled(true);
      setPrompt(null);
    } catch { setHelp(true); setPrompt(null); }
    finally { setBusy(false); }
  };

  return <>
    {!installed && <button className="install-button" onClick={install} disabled={busy}>
      <Smartphone size={17} /><span>{busy ? '설치 확인 중' : '앱 설치'}</span>
    </button>}
    {needRefresh && <div className="pwa-update" role="status">
      <span>새 버전이 준비됐어요. 저장 중인 메모를 마친 뒤 적용해 주세요.</span>
      <button onClick={() => void updateServiceWorker(true)}>새 버전 적용</button>
    </div>}
    {help && <dialog className="install-dialog" ref={dialog} onCancel={e => { e.preventDefault(); setHelp(false); }}>
      <div className="modal-head"><h2><Download size={20} /> 휴대폰에 앱으로 설치</h2><button className="icon-btn" aria-label="설치 안내 닫기" onClick={() => setHelp(false)}><X size={20}/></button></div>
      <p>홈 화면에 아이콘을 추가하면 앱처럼 바로 열 수 있어요. 앱스토어에서 내려받을 필요는 없어요.</p>
      <div className="install-guide"><h3>아이폰 · 아이패드</h3><ol><li>이 주소를 <strong>Safari</strong>에서 여세요.</li><li><strong>공유</strong> 버튼을 누르세요.</li><li><strong>홈 화면에 추가</strong>를 선택하고 추가하세요.</li></ol></div>
      <div className="install-guide"><h3>안드로이드</h3><ol><li>이 주소를 <strong>Chrome</strong>에서 여세요.</li><li>오른쪽 위 <strong>메뉴 ⋮</strong>를 누르세요.</li><li><strong>앱 설치</strong> 또는 <strong>홈 화면에 추가</strong>를 선택하세요.</li></ol></div>
      <p className="install-status" role="status">{registrationFailed ? '오프라인 준비를 마치지 못했어요. 인터넷 연결을 확인한 뒤 다시 열어주세요.' : offlineReady || navigator.serviceWorker?.controller ? '오프라인 사용 준비가 됐어요.' : '처음 한 번은 인터넷에 연결한 상태에서 열어주세요. 오프라인 파일을 준비하고 있어요.'}</p>
      <p>카카오톡 등 앱 안의 브라우저에서는 설치 메뉴가 없을 수 있어요. Safari나 Chrome으로 열어주세요. 휴대폰에 설치한 앱과 기존 브라우저의 저장 공간은 다를 수 있어요.</p>
      <p>앱을 닫거나 화면을 잠근 동안에는 알림음이 보장되지 않아요. 다시 열면 남은 시간과 종료 여부를 계산해요.</p>
      <button className="primary full" onClick={() => setHelp(false)}>알겠어요</button>
    </dialog>}
  </>;
}
