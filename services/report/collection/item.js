class CollectionItem {

    /**
     * @return string
     */
    getSlug() {
        throw new Error('Overwrite method getSlug()');
    }

    /**
     * @param {CollectionItem} member
     */
    isSame(member) {
        throw new Error('Overwrite method isSame()');
    }

    /**
     * @param {CollectionItem} member
     */
    groupWith(member) {
        throw new Error('Overwrite method groupWith()');
    }

}

exports.CollectionItem = CollectionItem;