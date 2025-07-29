const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());

app.get('/bypass', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).json({ error: 'URL obrigatória' });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
    });

    await page.goto(target, { waitUntil: 'networkidle2', timeout: 60000 });

    // Loop de clique automático
    const tentarClique = async () => {
      try {
        const botao = await page.$('a[href], button, .btn, .continuar');
        if (botao) {
          await botao.click();
          await page.waitForTimeout(3000);
        }
      } catch (e) {}
    };

    // Tenta clicar algumas vezes
    for (let i = 0; i < 5; i++) {
      await tentarClique();
      await page.waitForTimeout(3000);
    }

    // Aguarda mudança de URL
    let previousUrl = page.url();
    let attempts = 0;
    while (attempts < 10) {
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      if (currentUrl !== previousUrl) break;
      attempts++;
    }

    const finalURL = page.url();
    await browser.close();

    res.json({ success: true, url: finalURL });

  } catch (err) {
    res.status(500).json({ error: 'Falha no bypass', details: err.message });
  }
});

app.listen(3000, () => console.log('⚡️ Backend imortal rodando na porta 3000'));
