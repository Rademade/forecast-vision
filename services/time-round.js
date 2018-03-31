class TimeRound {

    static minutesToHours(minutes) {
        return this.roundHours( Math.round(minutes / 6) ) / 10;
    }

    static roundHours(hours) {
        return Math.round( hours * 10 ) / 10;
    }

    static roundPercents(number) {
        return Math.round(number * 10000) / 100
    }
}

exports.TimeRound = TimeRound;