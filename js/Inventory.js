class Inventory {
	constructor(MaxCapacity) {
		this._Items = []
		this._MaxCapacity = MaxCapacity;
		this._SelectedIndex = null;
	}
	AddItem(invItem) {
		if (invItem instanceof InventoryItem) {
			if (this._Items.length < this._MaxCapacity) {
				this._Items.push(invItem);
				return true;
			}
		}
		return false;
	}
	ClearItems() {
		this._Items.length = 0;
	}
	GetItemAt(id) {
		if (id >= 0 && id < this._Items.length) {
			return this._Items[id];
		}
	}

	Count() {
		return this._Items.length;
	}
	ClearItem(id) {
		if (id >= 0 && id < this._Items.length) {
			this._Items.splice(id, 1);
		}
	}
	SelectItem(id) {
		if (id >= 0 && id < this._Items.length) {
			this._SelectedIndex = id;
		}
	}
	ActivateItem(Player) {
		if (this._SelectedIndex !== null) {
			var ActivationResult = this._Items[this._SelectedIndex].ActivateItem(Player);
			if (this._Items[this._SelectedIndex].Amount === 0) {
				this._Items.splice(this._SelectedIndex, 1);
				if (this._SelectedIndex > this.Count() - 1) {
					this._SelectedIndex = this.Count() - 1
				}
			}
			return ActivationResult; //it may be undefined or new shell to spawn
		}
	}
}