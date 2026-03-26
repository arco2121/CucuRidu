const path = require('path');
const { Stanza } = require(path.join(__dirname, 'Stanza'));

class ClusterStanze {

    constructor(client, machine_id) {
        this.supabase = client;
        this.table = "stanze";
        this.keyField = "stanza_Id";
        this.machine_id = machine_id;
        this.valueField = "stanza";
    }

    async get(key) {
        const { data, error } = await this.supabase
            .from(this.table)
            .select(this.valueField)
            .eq(this.keyField, key)
            .maybeSingle();

        if (error || !data) return null;
        return await Stanza.fromJSON(data[this.valueField]);
    }

    async set(key, value) {
        const jsonToMerge = value?.toJSON ? value.toJSON() : value;

        const { error } = await this.supabase.rpc('update_stanza', {
            target_id: key,
            new_json: jsonToMerge,
            id_of_machine: this.machine_id
        });

        if (error) throw error;
    }

    async delete(key) {
        const { error } = await this.supabase
            .from(this.table)
            .delete()
            .eq(this.keyField, key)

        if (error) throw error;
    }

    async has(key) {
        const { data, error } = await this.supabase
            .from(this.table)
            .select(this.keyField)
            .eq(this.keyField, key)
            .maybeSingle();

        return !!data;
    }

    async clear() {
        const { error } = await this.supabase
            .from(this.table)
            .delete()
            .eq("machine_id", this.machine_id);

        if (error) throw error;
    }

    async keys() {
        const { data, error } = await this.supabase
            .from(this.table)
            .select(this.keyField);

        if (error || !data) return [];

        return data.map(item => item[this.keyField]);
    }

    async deletionKeys() {
        const { data, error } = await this.supabase
            .from(this.table)
            .select(this.keyField)
            .eq("machine_id", this.machine_id);

        if (error || !data) return [];

        return data.map(item => item[this.keyField]);
    }

    async values() {
        const { data, error } = await this.supabase
            .from(this.table)
            .select(`${this.keyField}, ${this.valueField}`);

        if (error || !data) return [];

        return Promise.all(data.map(async (item) => [
            item[this.keyField],
            await Stanza.fromJSON(item[this.valueField])
        ]));
    }

    async size() {
        const { count, error } = await this.supabase
            .from(this.table)
            .select('*', { count: 'exact', head: true })

        return error ? 0 : count;
    }
}

module.exports = { ClusterStanze };