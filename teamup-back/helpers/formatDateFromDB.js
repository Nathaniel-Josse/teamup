import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDateFromDB = (dateString, userTimezone) => {
    if (!dateString) return null;

    const dateInUTC = dayjs.utc(dateString);
    const userDate = dateInUTC.tz(userTimezone);

    if (userDate.isSame(dayjs().tz(userTimezone), 'day')) {
        return userDate.format('HH:mm');
    }
    return userDate.format('DD/MM/YYYY HH:mm');
};