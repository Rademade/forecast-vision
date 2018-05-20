class ForecastToggl {

    static getTogglProjectId(forecastProjectId) {
        if (forecastProjectId === 0) return 0;
        switch (forecastProjectId) {
            // TODO remove hard code
            // MVP solution.
            case 3: return 13119965;
            case 28: return 96711421;
            case 12: return 20276692;
            case 27: return 53073390;
            case 32: return 106414646;
            case 7: return 42019316;
            case 47: return 111478245;
            case 52: return 112858225;
            case 19: return 8231996;
            case 22: return 68939269;
            case 42: return 11934670;
            case 48: return 94097607;
            case 57: return 87769250; // MonArome
            case 44: return 109310247;
            case 30: return 12198792;
            case 5: return 39390403;
            case 31: return 100949343;
            case 49: return 111596660;
            case 4: return 72231986;
            case 43: return 12107328;
            case 50: return 74014765;
            case 54: return 112464383;
            case 36: return 105427065;
            case 11: return 12436751;
            case 58: return 118403052;// GrowthStripe
            default:
                console.log('Error with ID', forecastProjectId);
                return 0;
        }
    }

}

exports.ForecastToggl = ForecastToggl;