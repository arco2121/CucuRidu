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

const notificationsConfig = (app, database, memory, env = {}, timeout = 3600000) => {

    const sendNotification = async (payload, callback = () => {}, ...toWho) => {
        const promises = toWho.map(async (s) => {
            try {
                await webpush.sendNotification(s.subscription, payload);
            } catch (err) {
                await database.from('push_subscriptions').delete().eq("id", s.id);
                console.log(`Sottoscrizione rimossa per ID: ${s.id}`);
                callback();
            }
        });
        await Promise.all(promises);
    }

    const broadReminder = async () => {
      try {
          const { data: subs } = await database.from('push_subscriptions').select('*');
          const payload = JSON.stringify({
              title: "Cucu Ridu",
              body: "Non per essere petulante, ma se vuoi fare una partita ricordati che esisto",
              url: "/",
              actions: [
                  { action: 'open', title: 'Gioca' }
              ]
          });
          await sendNotification(payload, null, ...subs)
      } catch (error) { console.log(error.message); } finally {
          setTimeout(broadReminder, timeout*3);
      }
    };

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
        const { title, body, url, actions } = req.body || { title: "Default", body: "Default body" };
        const payload = JSON.stringify({ title: title, body: body, url: url, actions: actions });

        await sendNotification(payload, null, ...subs);
        res.json({ success: true });
    });

    app.post("/ottieniClientId", async (req, res) => {
        const id = await generateId(memory);
        res.status(200).json({ id: id });
    });

    app.post("/inviaSingola", async (req, res) => {
        const { title, body, who, actions, url } = req.body;
        if (!who) return res.status(400).json({ success: false });
        const payload = JSON.stringify({ title: title, body: body, url: url, actions: actions });

        const { data: sub } = await database
            .from('push_subscriptions')
            .select('*')
            .eq("client_Id", who)
            .maybeSingle();

        if (!sub) return res.status(404).json({ success: false, error: "User not subscribed" });

        await sendNotification(payload, () => {
            res.status(500).json({ success: false, error: "Push failed" });
        }, sub);
    });

    (async () => broadReminder())();
};

module.exports = { cleanUpStanze, notificationsConfig };