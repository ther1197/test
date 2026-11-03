import { test, expect } from '@playwright/test';

test('배포 경로에서 설치 정보·아이콘과 오프라인 메모·타이머 복원', async ({page,context}) => {
  await page.setViewportSize({width:390,height:844});
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('./');
  await expect(page.getByRole('button',{name:'앱 설치',exact:true})).toBeVisible();
  const manifest=await page.locator('link[rel="manifest"]').getAttribute('href');
  const response=await page.request.get(new URL(manifest!,page.url()).href);
  const data=await response.json();
  expect(data.display).toBe('standalone');expect(data.name).toBe('잠깐 집중');
  expect(data.start_url).toBe('./');expect(data.scope).toBe('./');
  for(const icon of data.icons){expect((await page.request.get(new URL(icon.src,page.url()).href)).ok()).toBe(true);}
  expect(await page.locator('meta[name="robots"]').getAttribute('content')).toContain('noindex');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
  // Chromium can offer its native install prompt; suppress it to verify manual instructions.
  await page.evaluate(()=>window.dispatchEvent(new Event('appinstalled')));
  await expect(page.getByRole('button',{name:'앱 설치',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'집중 시작하기'}).click();
  await expect(page.getByRole('button',{name:'잠깐 멈추기'})).toBeVisible();
  await page.getByRole('textbox',{name:'빠른 메모'}).fill('오프라인에서도 보관할 생각');
  await page.getByRole('button',{name:'메모 남기기'}).click();await expect(page.locator('.note')).toHaveCount(1);
  await page.getByRole('button',{name:'잠깐 멈추기'}).click();
  await expect(page.getByRole('button',{name:'다시 집중하기'})).toBeVisible();
  const paused=await page.getByRole('timer').innerText();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('timer')).toHaveText(paused);
  await expect(page.locator('.note-body>p')).toHaveText('오프라인에서도 보관할 생각');
  await page.getByRole('textbox',{name:'빠른 메모'}).fill('인터넷 없이 새 메모');
  await page.getByRole('button',{name:'메모 남기기'}).click();await expect(page.locator('.note')).toHaveCount(2);
  await page.getByRole('button',{name:'다시 집중하기'}).click();await expect(page.getByRole('button',{name:'잠깐 멈추기'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('수동 설치 안내 및 설치 요청은 사용자가 누를 때만 표시', async ({page}) => {
  await page.addInitScript(()=>window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();e.stopImmediatePropagation();},true));
  await page.goto('./');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button',{name:'앱 설치',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('Safari');
  await expect(page.getByRole('dialog')).toContainText('Chrome');
  await page.getByRole('button',{name:'알겠어요'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
