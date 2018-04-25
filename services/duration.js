class Duration {

    constructor(minutes = 0) {
        this.minutes = minutes;
    }

    setMinutes(minutes) {
        this.minutes = minutes;
        return this;
    }

    addMinutes(minutes) {
        this.minutes += minutes;
        return this;
    }

    /**
     * @param {Duration} duration
     */
    add(duration) {
        this.addMinutes( duration.getMinutes() );
        return this;
    }

    /**
     * @param {Duration} duration
     * @param {Object} opts
     */
    remove(duration, opts = {min: null}) {
        this.addMinutes( duration.getMinutes() * -1 );

        if (opts.min !== null) {
            if (this.getMinutes() < opts.min) { this.setMinutes(opts.min); }
        }

        return this;
    }

    getMinutes() {
        return this.minutes;
    }

    getHours() {
        let hours = Math.round(this.minutes / 6) / 10;
        return Math.round( hours * 10 ) / 10;
    }

    getRatio(duration) {
        if (this.getMinutes() === 0) return null;
        if (duration.getMinutes() === 0) return null;

        let number = this.getMinutes() / duration.getMinutes();
        return Math.round(number * 10000) / 100
    }

    compare(duration) {
        return this.getMinutes() - duration.getMinutes();
    }

    clone() {
        return new Duration(this.getMinutes());
    }

    toString() {
        return this.getHours();
    }

}

exports.Duration = Duration;