class TimeRound {

    /**
     * @param {Number} minutes
     * @returns {Number}
     */
    static minutesToHours(minutes) {
        return this.roundHours( Math.round(minutes / 6) ) / 10;
    }

    /**
     * @param {Number} hours
     * @returns {Number}
     */
    static roundHours(hours) {
        return Math.round( hours * 10 ) / 10;
    }

    /**
     * @param {Number} number
     * @returns {Number}
     */
    static roundPercents(number) {
        return Math.round(number * 10000) / 100
    }
}

exports.TimeRound = TimeRound;