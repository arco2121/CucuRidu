const path = require('path');
const { Stanza } = require(path.join(__dirname, 'Stanza'));
const { ClusterMap } = require(path.join(__dirname, 'ClusterMap'));

class ClusterStanze extends ClusterMap {

    constructor(client, machine_id) {
        super(client, machine_id);
        this.table = "stanze";
        this.keyField = "stanza_Id";
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

        return value;
    }

    async checkOld() {
        const { error } = await this.supabase.rpc('delete_old_stanze');
        if (error) throw error;
    }


    async values() {
        return (await this.entries()).map(entry => entry[1]);
    }

    async entries() {
        const { data, error } = await this.supabase
            .from(this.table)
            .select(`${this.keyField}, ${this.valueField}`);

        if (error || !data) return [];

        return Promise.all(data.map(async (item) => [
            item[this.keyField],
            await Stanza.fromJSON(item[this.valueField])
        ]));
    }
}

module.exports = { ClusterStanze };