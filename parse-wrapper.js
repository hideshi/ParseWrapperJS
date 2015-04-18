function ParseJS(applicationId, javascriptKey) {
    console.log('init');
    Parse.initialize(applicationId, javascriptKey);
}

ParseJS.prototype.selectFrom = function(clazz) {
    console.log('selectFrom');
    this.clazz = clazz;
    return this;
}

ParseJS.prototype.where = function(conditions) {
    console.log('where');
    this.conditions = conditions;
    return this;
}

ParseJS.prototype.orderBy = function(sortOrders) {
    console.log('orderBy');
    this.sortOrders = sortOrders;
    return this;
}

ParseJS.prototype.join = function(joinClasses) {
    console.log('join');
    this.joinClasses = joinClasses;
    return this;
}

ParseJS.prototype.limit = function(limitation) {
    console.log('limit');
    this.limitation = limitation;
    return this;
}

ParseJS.prototype.offset = function(offset_position) {
    console.log('offset');
    this.offset_position = offset_position;
    return this;
}

ParseJS.prototype.build = function() {
    console.log('build');
    var cls = Parse.Object.extend(this.clazz);
    this.query = new Parse.Query(cls);
    for(var key in this.joinClasses) {
        this.query.include(this.joinClasses[key].toLowerCase());
    }
    for(var sortOrder in this.sortOrders) {
        var arr = this.sortOrders[sortOrder].replace(/^\s+|\s+$/g, '').split(/\s+/);
        if(arr.length === 1 || arr[1].toLowerCase() === 'asc') {
            this.query.ascending(arr[0]);
        } else {
            this.query.descending(arr[0]);
        }
    }
    for(var key in this.conditions) {
        this.query.equalTo(key, this.conditions[key]);
    }
    this.query.limit(this.limitation)
    this.query.skip(this.offset_position);
    this.clazz = null;
    this.conditions = null;
    this.sortOrders = null;
    this.joinClasses = null;
    this.limitation = null;
    this.offset_position = null;
    return this;
}

ParseJS.prototype.find = function() {
    console.log('find');
    var query = this.query;
    return new Promise(function(resolve, reject) {
        query.find({
            success: function(results) {
                resolve(results);
            },
            error: function(error) {
                reject(error);
            }
        });
    });
}

ParseJS.prototype.count = function() {
    console.log('count');
    var query = this.query;
    return new Promise(function(resolve, reject) {
        query.count({
            success: function(count) {
                resolve(count);
            },
            error: function(error) {
                reject(error);
            }
        });
    });
}

ParseJS.prototype.save = function(conditions) {
    return Promise.all(Object.keys(conditions).map(function(className) {
        var Class = Parse.Object.extend(className);
        var obj = new Class();
        for(var key in conditions[className]) {
            if(key.endsWith('$')) {
                column = key.replace('$', '');
                var Parent = Parse.Object.extend(column.charAt(0).toUpperCase() + column.slice(1));
                var p = new Parent();
                p.id = conditions[className][key]; 
                obj.set(column, p);
            } else {
                obj.set(key, conditions[className][key]);
            }
        }
        return save(obj);
    }));
}

function save(obj) {
    return new Promise(function(resolve, reject) {
        obj.save(null, {
            success: function(result) {
                resolve(result);
            },
            error: function(result, error) {
                reject(error);
            }
        });
    });
}
