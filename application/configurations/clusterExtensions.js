const webpush = require('web-push');
const path = require('path');
const { generateId } = require(path.join(__dirname, "../include/script/generazione"));

const cleanUpStanze = (Stanze, timeout = 3600000) => {
    const cleanUpIfOld = async () => {
        try {
           await Stanze.checkOld();
        } catch (err) { console.error(err); } finally {
            setTimeout(cleanUpIfOld, timeout/60);
        }
    };

    cleanUpIfOld();
};

const notificationsConfig = (app, database, memory, env = {}) => {
    webpush.setVapidDetails('mailto:devcolombara@gmail.com', env.NOTIFICATION_PUBLIC, env.NOTIFICATION_PRIVATE);

    app.post('/registraNotifica', async (req, res) => {
        const { subscription, id } = req.body;

        const { error } = await database
            .from('push_subscriptions')
            .upsert([{
                client_Id: id,
                subscription: subscription,
                endpoint: subscription.endpoint
            }], { onConflict: 'endpoint' });

        if (error) return res.status(500).json(error);
        res.status(201).json({ result: true });
    });

    app.post('/eliminaNotifica', async (req, res) => {
        const { endpoint, clientId } = req.body;
        if(!endpoint) return res.status(400).json({ success: false, error: "Endpoint mancante" });

        const { error } = await database
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', endpoint)
            .eq('client_Id', clientId)

        if (error) {
            console.error("Errore cancellazione:", error);
            return res.status(500).json({ success: false });
        }

        res.status(200).json({ success: true });
    });

    app.post('/inviaBroadcast', async (req, res) => {
        const { data: subs } = await database.from('push_subscriptions').select('*');
        const { title, body } = req.body || { title: "Default", body: "Default body" };
        const payload = JSON.stringify({ title, body });

        const promises = subs.map(async (s) => {
            try {
                await webpush.sendNotification(s.subscription, payload);
            } catch (err) {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await database.from('push_subscriptions').delete().eq("id", s.id);
                    console.log(`Sottoscrizione rimossa per ID: ${s.id}`);
                } else {
                    console.error("Errore invio push:", err.endpoint);
                }
            }
        });

        await Promise.all(promises);
        res.json({ success: true });
    });

    app.post("/ottieniClientId", async (req, res) => {
        const id = await generateId(memory);
        res.status(200).json({ id: id });
    });

    app.post("/inviaSingola", async (req, res) => {
        const { titolo, corpo, who } = req.body;
        if (!who) return res.status(400).json({ success: false });

        const { data: sub } = await database
            .from('push_subscriptions')
            .select('*')
            .eq("client_Id", who)
            .maybeSingle();

        if (!sub) return res.status(404).json({ success: false, error: "User not subscribed" });

        try {
            const payload = JSON.stringify({ title: titolo, body: corpo });
            await webpush.sendNotification(sub.subscription, payload);
            res.json({ success: true });
        } catch (err) {
            if (err.statusCode === 410) {
                await database.from('push_subscriptions').delete().eq("id", sub.id);
            }
            res.status(500).json({ success: false, error: "Push failed" });
        }
    });
};

module.exports = { cleanUpStanze, notificationsConfig };