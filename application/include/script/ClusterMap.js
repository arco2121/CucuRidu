class ClusterMap {

    constructor(client, machine_id) {
        this.supabase = client;
        this.table = "items";
        this.keyField = "item_id";
        this.machine_id = machine_id;
        this.valueField = "value";
    }

    async get(key) {
        const { data, error } = await this.supabase
            .from(this.table)
            .select(this.valueField)
            .eq(this.keyField, key)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;
        return data[this.valueField]?.data;
    }

    async set(key, value) {
        const json = { data: value };

        const { error } = await this.supabase.rpc('update_item', {
            target_id: key,
            new_json: json,
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

        if (error) throw error;
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

        if (error) throw error;
        if (!data) return [];

        return data.map(item => item[this.keyField]);
    }

    async values() {
        return (await this.entries()).map(entry => entry[1]);
    }

    async entries() {
        const { data, error } = await this.supabase
            .from(this.table)
            .select(`${this.keyField}, ${this.valueField}`);

        if (error) throw error;
        if (!data) return [];

        // I valori delle mappe sono salvati come JSON { data: valore }.
        // Restituiamo il valore interno, come fa una Map standard.
        return data.map(item => [
            item[this.keyField],
            item[this.valueField]?.data
        ]);
    }

    async size() {
        const { count, error } = await this.supabase
            .from(this.table)
            .select('*', { count: 'exact', head: true })

        if (error) throw error;
        return count || 0;
    }
}

module.exports = { ClusterMap };
