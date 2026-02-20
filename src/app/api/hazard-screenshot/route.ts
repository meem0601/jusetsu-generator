import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const { address } = await request.json();

  if (!address) {
    return NextResponse.json({ error: '住所が必要です' }, { status: 400 });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1200, height: 800 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();

    // disaportalを開く
    await page.goto('https://disaportal.gsi.go.jp/maps/index.html', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // 住所検索
    const searchBox = await page.$('input[type="search"]');
    if (searchBox) {
      await searchBox.click();
      await searchBox.type(address);
    }

    // 検索ボタンクリック
    const searchBtn = await page.$('a#addr_search_btn, button[title="検索ボタン"]');
    if (searchBtn) {
      await searchBtn.click();
    } else {
      await page.evaluate(() => {
        const btns = document.querySelectorAll('a, button');
        for (const b of btns) {
          if (b.getAttribute('title')?.includes('検索')) {
            (b as HTMLElement).click();
            break;
          }
        }
      });
    }

    // 洪水レイヤー＋読み込み待ち
    await new Promise(r => setTimeout(r, 10000));

    // ① 洪水スクリーンショット
    const floodScreenshot = await page.screenshot({ type: 'png', encoding: 'base64' });

    // ポップアップ閉じる
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.leaflet-popup-close-button') as HTMLElement;
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // ② 土砂災害に切り替え
    await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      for (const l of links) {
        if (l.textContent?.includes('選択情報のリセット')) {
          l.click();
          break;
        }
      }
    });
    await new Promise(r => setTimeout(r, 2000));

    await page.evaluate(() => {
      const img = document.getElementById('dosya_map_icon') as HTMLElement;
      if (img) img.click();
    });
    await new Promise(r => setTimeout(r, 8000));

    const landslideScreenshot = await page.screenshot({ type: 'png', encoding: 'base64' });

    // ③ 津波に切り替え
    await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      for (const l of links) {
        if (l.textContent?.includes('選択情報のリセット')) {
          l.click();
          break;
        }
      }
    });
    await new Promise(r => setTimeout(r, 2000));

    await page.evaluate(() => {
      const img = document.getElementById('tsunami_map_icon') as HTMLElement;
      if (img) img.click();
    });
    await new Promise(r => setTimeout(r, 8000));

    const tsunamiScreenshot = await page.screenshot({ type: 'png', encoding: 'base64' });

    return NextResponse.json({
      flood: floodScreenshot,
      landslide: landslideScreenshot,
      tsunami: tsunamiScreenshot,
    });
  } catch (error) {
    console.error('Hazard screenshot error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'スクリーンショット取得に失敗しました' },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}
