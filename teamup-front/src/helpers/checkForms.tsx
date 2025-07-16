export const checkEventForm = (form: any) => {
    if (!form.title || !form.starting_date || !form.ending_date || !form.location) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        if (form.starting_date > form.ending_date) {
            alert('La date de début doit être antérieure à la date de fin.');
            return;
        }
        if (form.max_attendees < 0) {
            alert('Le nombre maximum de participants ne peut pas être négatif.');
            return;
        }
        if (form.status !== 'open' && form.status !== 'closed' && form.status !== 'done' && form.status !== 'cancelled') {
            alert('Statut invalide.');
            return;
        }
    return true;
}