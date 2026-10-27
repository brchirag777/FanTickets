export const formatEventDate = (date) => {
    if (!date) return 'Date TBA';
    return new Date(date).toLocaleString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatPrice = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
