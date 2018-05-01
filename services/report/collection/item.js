class CollectionItem {

    getSlug() {
        throw new Error('Overwrite method getSlug()');
    }

    isSame(item) {
        return item instanceof CollectionItem && this.getSlug() === item.getSlug();
    }

    groupWith() {
        throw new Error('Overwrite method groupWith()');
    }

}

exports.CollectionItem = CollectionItem;