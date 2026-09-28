# Startup — Boot Sequence Simulation

An animated, full-screen visualization of a typical computer startup sequence, built with plain HTML, CSS, and JavaScript.

## Run in VS Code

1. Open the `OS-Bootloader-Simulation` folder in VS Code.
2. Open `index.html`.
3. Double-click `index.html` in File Explorer to run it in your browser, or use VS Code's Live Server extension.
4. Press **Enter** or click the first screen to power on. The phases progress automatically. Choose **Skip Intro** to jump to the ready screen; choose **Restart** to replay.

## What the screens show

- Power on
- Firmware / UEFI hardware checks
- Finding a boot device and starting its bootloader
- Loading the kernel into memory and handing control to it
- Essential initialization complete and the OS ready

This is a simplified educational visualization. The exact process varies by firmware, computer, and operating system.
