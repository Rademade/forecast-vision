class CollectionList {

    constructor() {
        this.items = {};
    }

    /**
     * @param {CollectionItem} item
     * @return {CollectionItem}
     */
    addItem(item) {
        // TODO remove slugs
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
        let keys = Object.keys(this.items);
        let length = keys.length;
        for (let i = 0; i < length - 1; i++) {
            let checkItem = this.items[ keys[i] ];
            for (let j = i + 1; j < length; j++) {
                let matchedItem = this.items[ keys[j] ];
                if (matchedItem && matchedItem.isSame(checkItem)) {
                    checkItem.groupWith(matchedItem);
                    delete this.items[ keys[j] ];
                }
            }
        }
    }

}

exports.CollectionList = CollectionList;

