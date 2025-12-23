class TimeUtil {
    /**
     * Display a date diff with current date in text
     * 
     * @param {*} date date to compare with current date
     * 
     * @returns a text with the date period
     * 
     */
    static timeFromNow(date) { 
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000); 
        const intervals = [ 
            { label: "year", secs: 31536000 }, 
            { label: "month", secs: 2592000 },
            { label: "day", secs: 86400 }, 
            { label: "hour", secs: 3600 }, 
            { label: "minute", secs: 60 }, 
            { label: "second", secs: 1 } 
        ]; 
        
        for (const interval of intervals) { 
            const count = Math.floor(seconds / interval.secs); 
            if (count >= 1) { 
                return count === 1 ? 
                    `1 ${interval.label} ago` : 
                    `${count} ${interval.label}s ago`; 
            } 
        } 
    }

    static formatTimestamp(date = new Date()) {
        const pad = (n, width = 2) => String(n).padStart(width, "0");

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());

        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        const millis = pad(date.getMilliseconds(), 3);

        const offset = -date.getTimezoneOffset(); // minutes
        const sign = offset >= 0 ? "+" : "-";
        const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
        const offsetMinutes = pad(Math.abs(offset) % 60);

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${millis}${sign}${offsetHours}${offsetMinutes}`;
    }
}