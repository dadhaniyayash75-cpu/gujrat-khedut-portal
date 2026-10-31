const axios = require('axios');
const SmsLog = require('../models/SmsLog');

/**
 * Modular SMS Service supporting:
 * - Twilio
 * - MSG91 (India DLT)
 * - 2Factor (India)
 * - Simulator Mode (Default fallback for testing/dev)
 */
class SmsService {
    constructor() {
        this.gateway = process.env.SMS_GATEWAY || 'simulator'; // 'twilio', 'msg91', '2factor', 'simulator'
    }

    async sendSms(mobile, message) {
        // Clean mobile number (keep last 10 digits for Indian numbers)
        const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
        let logStatus = 'simulated';
        let errorDetails = null;

        try {
            if (this.gateway === 'twilio' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
                // Twilio REST API
                const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
                const params = new URLSearchParams();
                params.append('To', `+91${cleanMobile}`);
                params.append('From', process.env.TWILIO_PHONE_NUMBER);
                params.append('Body', message);

                await axios.post(
                    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
                    params,
                    { headers: { Authorization: `Basic ${auth}` } }
                );
                logStatus = 'sent';
            } else if (this.gateway === 'msg91' && process.env.MSG91_AUTH_KEY) {
                // MSG91 API
                await axios.post(
                    'https://control.msg91.com/api/v5/flow/',
                    {
                        template_id: process.env.MSG91_TEMPLATE_ID,
                        short_url: '0',
                        recipients: [{ mobiles: `91${cleanMobile}`, message }]
                    },
                    { headers: { authkey: process.env.MSG91_AUTH_KEY } }
                );
                logStatus = 'sent';
            } else if (this.gateway === '2factor' && process.env.TWOFACTOR_API_KEY) {
                // 2Factor API
                const url = `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/ADDON_SERVICES/SEND/TSMS`;
                await axios.post(url, {
                    From: process.env.TWOFACTOR_SENDER_ID || 'KHEDUT',
                    To: cleanMobile,
                    Msg: message
                });
                logStatus = 'sent';
            } else {
                // Simulator Mode
                console.log('\n================== [SIMULATED SMS DISPATCH] ==================');
                console.log(`📱 To Mobile: +91 ${cleanMobile}`);
                console.log(`💬 Message:\n${message}`);
                console.log('==============================================================\n');
                logStatus = 'simulated';
            }
        } catch (err) {
            console.error('SMS Gateway Error:', err.message);
            logStatus = 'failed';
            errorDetails = err.message;
        }

        // Audit Log into MongoDB
        try {
            await SmsLog.create({
                mobile: cleanMobile,
                message,
                gateway: this.gateway,
                status: logStatus,
                errorDetails
            });
        } catch (logErr) {
            console.error('Failed to save SMS log:', logErr.message);
        }

        return { success: logStatus !== 'failed', status: logStatus };
    }

    // 1. Alert to Provider on New Request
    async sendNewRequestAlert(provider, receiver, booking) {
        const msg = 
`[ગુજરાત ખેડૂત પોર્ટલ] નવો સર્વિસ રિક્વેસ્ટ!
ખેડૂત: ${receiver.fullName}
ગામ: ${booking.receiverLocation?.village || receiver.village}
સર્વિસ: ${booking.service}
તારીખ: ${booking.date} (${booking.time})
અંતર: આશરે ${booking.distanceKm || 0} કિમી.
સ્વીકારવા અથવા રદ કરવા માટે પોર્ટલ પર લૉગિન કરો.`;
        return this.sendSms(provider.mobile, msg);
    }

    // 2. Alert to Receiver on Status Update
    async sendStatusUpdateAlert(receiver, provider, booking, newStatus) {
        let statusGujarati = newStatus;
        if (newStatus === 'accepted') statusGujarati = 'સ્વીકાર કર્યો છે (Accepted)';
        else if (newStatus === 'rejected') statusGujarati = 'રદ કર્યો છે (Declined)';
        else if (newStatus === 'on_the_way') statusGujarati = 'તમારા ખેતરે આવવા નીકળી ગયા છે (On The Way)';
        else if (newStatus === 'arrived') statusGujarati = 'ખેતરે પહોંચી ગયા છે (Arrived)';
        else if (newStatus === 'service_started') statusGujarati = 'ખેતીકામ શરૂ થયું છે (Service Started)';
        else if (newStatus === 'completed') statusGujarati = 'કામ પૂર્ણ થયું છે (Completed)';

        const msg = 
`[ગુજરાત ખેડૂત પોર્ટલ] બુકિંગ સ્ટેટસ અપડેટ!
બુકિંગ ID: ${booking.bookingId}
સર્વિસ: ${booking.service}
પ્રોવાઈડર: ${provider.fullName} (${provider.mobile})
નવું સ્ટેટસ: ${statusGujarati}
લાઇવ ટ્રેકિંગ માટે પોર્ટલ જુઓ.`;
        return this.sendSms(receiver.mobile, msg);
    }

    // 3. Alert on Cancellation
    async sendCancellationAlert(targetUser, booking, reason) {
        const msg = 
`[ગુજરાત ખેડૂત પોર્ટલ] બુકિંગ રદ થયું છે!
બુકિંગ ID: ${booking.bookingId}
સર્વિસ: ${booking.service}
કારણ: ${reason || 'ખેડૂત/પ્રોવાઈડર દ્વારા રદ કરવામાં આવ્યું'}
વિગતો માટે પોર્ટલ પર લૉગિન કરો.`;
        return this.sendSms(targetUser.mobile, msg);
    }
}

module.exports = new SmsService();
