// Debug Helper - View localStorage data
// Open browser console (F12) and paste this code to check your data

console.log('=== MASJID APP DEBUG INFO ===');
console.log('\n1. Members in localStorage:');
const members = localStorage.getItem('masjid_members');
if (members) {
    console.log(JSON.parse(members));
    console.log(`Total members: ${JSON.parse(members).length}`);
} else {
    console.log('No members found in localStorage');
}

console.log('\n2. Payments in localStorage:');
const payments = localStorage.getItem('masjid_payments');
if (payments) {
    console.log(JSON.parse(payments));
    console.log(`Total payments: ${JSON.parse(payments).length}`);
} else {
    console.log('No payments found in localStorage');
}

console.log('\n3. To clear all data, run:');
console.log('localStorage.clear()');

console.log('\n=== END DEBUG INFO ===');
