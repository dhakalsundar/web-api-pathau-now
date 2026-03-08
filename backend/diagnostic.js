// Quick diagnostic script
console.log('Starting diagnostic...');

try {
  console.log('Importing services...');
  require('./dist/services/socket.event.manager');
  console.log(' socket.event.manager imported');
  
  require('./dist/services/notification.service');
  console.log(' notification.service imported');
  
  require('./dist/services/shipment.service');
  console.log(' shipment.service imported');
  
  require('./dist/index');
  console.log(' index imported');
  
} catch (error) {
  console.error('ERROR:', error);
  process.exit(1);
}
