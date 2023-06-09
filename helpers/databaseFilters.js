"use strict";

const { BadRequestError } = require("../expressError");

/** Abstract class for filters use to generate WHERE clause for sql statements. */
class Filter {

    /**
     * NOTE: should not use this abstract constructor!
     * Creates a new filter
     *
     * @param {*} value the filter parameter from the user.
     * for example would be 10 if they specified { minEmployees: 10 }
     */
    constructor(value) {
        this.value = value;
    }

    /** Generate a where clause and '$' + index for the position of filter was
     * passed in
     *
     * OR null if there is no whereStringPart for this filter (eg if the filter
     * is disabled)
     * */
    getWhereStringPart(startingParamIndex) {
        throw new Error("should not instantiate abstract Filter");
    }

    /** Get value of specified value for this filter
     *  OR null if there is no value for this filter
     */
    getValue() {
        return this.value;
    }

    /** Take a object of filter names and values, returns array of corresponding
     * filter child classes
     * {nameLike: "google", minEmployees:10, maxEmployee:100} =>
     * [CompanyNameLikeFilter, MinEmployeesFilter, ...]
     * */

    static buildFilters(filtersPOJO) {

        this.validateFilter(filtersPOJO);

        const filters = Object.entries(filtersPOJO)
            .map(([filterName, filterVal]) => {

                // get the class corresponding to this filter
                const filterClass = filterMap[filterName];

                // construct instance of the class with the value
                // for the filter specified by the user
                return new filterClass(filterVal);
            });

        return filters;
    }

    /**Take an object of filter names and values, determine if minEmployee and
     * maxEmployee are inside POJO and throw error if minEmployee is greater than
     * maxEmployee */

    static validateFilter(filtersPOJO) {
        if ("minEmployees" in filtersPOJO && "maxEmployees" in filtersPOJO) {
            if (Number(filtersPOJO.minEmployees) > Number(filtersPOJO.maxEmployees)) {
                throw new BadRequestError(`minEmployees can't be greater than maxEmployees`);
            }
        }
    }
}

class MinEmployeesFilter extends Filter {
    constructor(minEmployees) {
        super(minEmployees);
    }

    getWhereStringPart(startingParamIndex) {
        return `num_employees >= $${startingParamIndex}`;
    }
}

class MaxEmployeesFilter extends Filter {
    constructor(maxEmployees) {
        super(maxEmployees);
    }

    getWhereStringPart(startingParamIndex) {
        return `num_employees <= $${startingParamIndex}`;
    }
}

class CompanyNameLikeFilter extends Filter {
    constructor(name) {
        super();
        this.name = name;
    }

    getWhereStringPart(startingParamIndex) {
        return `name ILIKE $${startingParamIndex}`;
    }

    /** overridden to add '%'s for SQL ILIKE*/
    getValue() {
        return `%${this.name}%`;
    }
}

class TitleFilter extends Filter {
    constructor(title) {
        super();
        this.title = title;
    }

    getWhereStringPart(startingParamIndex) {
        return `title ILIKE $${startingParamIndex}`;
    }

    /** overridden to add '%'s for SQL ILIKE*/
    getValue() {
        return `%${this.title}%`;
    }
}

class MinSalaryFilter extends Filter {
    constructor(minSalary) {
        super(minSalary);
    }

    getWhereStringPart(startingParamIndex) {
        return `salary >= $${startingParamIndex}`;
    }
}

class HasEquityFilter extends Filter {
    constructor(enabled) {
        super();
        this.enabled = enabled;
    }

    getWhereStringPart(startingParamIndex) {
        return this.enabled ? `equity > 0` : null;
    }

    getValue() {
        return null;
    }
}

const filterMap = {
    "minEmployees": MinEmployeesFilter,
    "maxEmployees": MaxEmployeesFilter,
    "nameLike": CompanyNameLikeFilter,
    "title": TitleFilter,
    "minSalary": MinSalaryFilter,
    "hasEquity": HasEquityFilter
};


module.exports = {
    Filter
};