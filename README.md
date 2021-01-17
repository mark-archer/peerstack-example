# Example Application Using Peerstack

This will work without running a server.  Just load [index.html](index.html) directly into your browser from disk and enter your user id and secret key.  A new user id and secret key is generated by default to make testing easy but you can use your own if you have them.

## A few of things to try out

Connect two devices
- Load the page in two separate browsers or two separate devices 
  - Two tabs in the same browser won't work, that's considered the same device
- Click `connect to network` on both
- Copy the device id of one to the `connect to known device` field on the other
- Click `connect`
- Both devices should now show the other device in `Connected Devices`
- Open the dev tools on both and click the `ping` button on either one
- Observe the other device receives the ping and sends back `pong`

Automatic device discovery
- Reload the page on both devices to disconnect from the network and clear state
- Click `connect to network` on the first device
- Copy the `User Id` and `Secret Key` from the first device to the second device
- Click `connect to network` on the second device
- Observe that the device id of the first device automatically shows up in `Available Devices` on the second device.  This is because the network detected that the devices are controlled by the same user so they should automatically become aware of each other.  This will also be true if the users are different but both members of one or more of the same groups.

Transfer a file
- Connect two (or more) devices using one of the above methods
- Click `Choose File` and select a file
- A file id should now be visible, copy it into the `file id` field in the other device
- Click `request` and observe the transfer progress in the console output
- Once the file has finished transferring you can click the `Save File` link
