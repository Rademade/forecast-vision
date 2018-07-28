class CollectionItem {

    getSlug() {
        throw new Error('Overwrite method getSlug()');
    }

    isSame(member) {
        throw new Error('Overwrite method isSame()');
    }

    groupWith(member) {
        throw new Error('Overwrite method groupWith()');
    }

}

exports.CollectionItem = CollectionItem;