const path = require('path');
const { Stanza } = require(path.join(__dirname, 'Stanza'));

class ClusterStanze {

    constructor(client) {
        this.supabase = client;
        this.table = "Stanze";
        this.keyField = "stanza_Id";
        this.valueField = "JSONB";
    }

    async get(key) {
        const { data, error } = await this.supabase
            .from(this.table)
            .select(this.valueField)
            .eq(this.keyField, key)
            .maybeSingle();

        if (error || !data) return null;
        return Stanza.fromJSON(data[this.valueField]);
    }

    async set(key, value) {
        const jsonToMerge = value?.toJSON ? value.toJSON() : value;

        const { error } = await this.supabase.rpc('upsert_stanza_merge', {
            target_id: key,
            new_json: jsonToMerge
        });

        if (error) throw error;
    }

    async delete(key) {
        const { error } = await this.supabase
            .from(this.table)
            .delete()
            .eq(this.keyField, key);

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
            .neq(this.keyField, "_placeholder_");

        if (error) throw error;
    }

    async values() {
        const { data, error } = await this.supabase
            .from(this.table)
            .select(`${this.keyField}, ${this.valueField}`);

        if (error) return [];
        return data.map(item => Stanza.fromJSON(item[this.valueField]));
    }

    async size() {
        const { count, error } = await this.supabase
            .from(this.table)
            .select('*', { count: 'exact', head: true })

        return error ? 0 : count;
    }
}

module.exports = { ClusterStanze };