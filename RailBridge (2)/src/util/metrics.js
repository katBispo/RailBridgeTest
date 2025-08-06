class Metrics {
    constructor(size) {
        this.buffer = new Array(size);
        this.size = size;
        this.index = 0;
        this.count = 0;
    }

    add = (value) => {
        this.buffer[this.index] = { timestamp: Date.now(), value };
        this.index = (this.index + 1) % this.size;
        if (this.count < this.size) {
            this.count++
        }
    }

    getRecentValues = (windowMS) => {
        const now = Date.now();
        const result = [];
        for (let i = 0; i < this.count; i++) {
            const item = this.buffer[i];
            if (item && (now - item.timestamp <= windowMS)) {
                result.push(item.value);
            }
        }
        return result;
    }

    getMovingAverage = (windowMS) => {
        const values = this.getRecentValues(windowMS);
        if (values.length === 0) return null;
        const sum = values.reduce((acc, v) => acc + v, 0);
        return sum / values.length;
    }
}

module.exports = Metrics