class ClusterSet {

    constructor(client, setName, table = "memory") {
        this.supabase = client;
        this.table = table;
        this.setName = setName;
    }

    async add(item) {
        const { error } = await this.supabase
            .from(this.table)
            .upsert({
                set_name: this.setName,
                item_id: String(item)
            });

        if (error) throw error;
    }

    async has(item) {
        const { data, error } = await this.supabase
            .from(this.table)
            .select("item_id")
            .eq("item_id", String(item))
            .maybeSingle();

        if (error) throw error;
        return !!data;
    }

    async delete(item) {
        const { error } = await this.supabase
            .from(this.table)
            .delete()
            .eq("set_name", this.setName)
            .eq("item_id", String(item));

        if (error) throw error;
    }

    async clear() {
        const { error } = await this.supabase
            .from(this.table)
            .delete()
            .eq("set_name", this.setName);

        if (error) throw error;
    }

    /** Rimuove gli ID scaduti che non sono piu' usati da stanze attive. */
    async cleanOld() {
        const { error } = await this.supabase.rpc("delete_old_memory");
        if (error) throw error;
    }

    async values() {
        const { data, error } = await this.supabase
            .from(this.table)
            .select("item_id")
            .eq("set_name", this.setName);

        if (error) throw error;
        return (data || []).map(row => row.item_id);
    }

    async size() {
        const { count, error } = await this.supabase
            .from(this.table)
            .select("*", { count: "exact", head: true })
            .eq("set_name", this.setName);

        if (error) throw error;
        return count || 0;
    }
}

module.exports = { ClusterSet };
