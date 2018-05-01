class CollectionList {

    constructor() {
        this.items = {};
    }

    /**
     * @param {CollectionItem} item
     * @return {CollectionItem}
     */
    addItem(item) {
        let slug = item.getSlug();
        if (!this.items[ slug ]) {
            this.items[ slug ] = item;
        } else {
            // TODO add validation for multi addItem call
            this.items[ slug ].groupWith( item );
        }
        return this.items[ slug ];
    }


    /**
     * Group similar members in this collection
     */
    groupSimilar() {
        this._getItemsGroups().forEach((itemsGroup) => {
            let _baseItem;

            for (let i = 0; i < itemsGroup.length; i++) {

                if (!_baseItem) {
                    _baseItem = this.items[itemsGroup[i]];
                }

                let groupMember = this.items[itemsGroup[i]];

                // Don't group same member
                if (_baseItem && groupMember && !_baseItem.isSame(groupMember)) {
                    _baseItem.groupWith( groupMember );
                    delete this.items[itemsGroup[i]];
                }
            }
        });
    }

    _getItemsGroups() {
        return [];
    }

}

exports.CollectionList = CollectionList;

