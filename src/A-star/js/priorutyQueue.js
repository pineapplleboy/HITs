export class PriorityQueue {
    constructor() {
        this.storage = new Array();
    }

    addElem(number, priority = 0) {
        this.storage.push({num: number, prior: priority});
    }

    getElem() {
        this.storage.sort(
            function compare(first, second) {
                return -(second.prior - first.prior);
            }
            );
        
        return this.storage.shift().num;
    }

    isEmpty() {
        return this.storage.length === 0;
    }

    size() {
        return this.storage.length;
    }
}
