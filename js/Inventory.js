class Inventory {
	constructor(MaxCapacity) {
		this._Items = []
        this._MaxCapacity = MaxCapacity;
	}
	AddItem(invItem) {
		if (invItem instanceof InventoryItem) {
            if(this._Items.length < this._MaxCapacity)
            {
                this._Items.push(invItem);
            }
		}
	}
	ClearItems() {
		this._Items.length = 0;
	}
	GetItemAt(id) {
		if (id > 0 && id < this._Items.length) {
			return this._Items[id];
		}
	}
	ClearItem(id) {
		if (id > 0 && id < this._Items.length) {
			this._Items.splice(id, 1);
		}
	}
	ActivateItemById(id, Player) {
		if (id > 0 && id < this.Items.length) {
			var ActivationResult = this._Items[id].ActivateItem(Player);
			if (this._Items[id].Amount == 0) {
				this._Items.splice(id, 1);
			}
			return ActivationResult; //it may be undefined or new shell to spawn
		}
	}
}