'use strict'

const { GObject, St, Clutter } = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension()
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const SystemActions = imports.misc.systemActions;

const PowerButton = GObject.registerClass(
class PowerButton extends St.Button{
    _init(powerIcon, powerLabel, action){
        super._init({
            style_class: 'pm-btn',
            track_hover: true,
            can_focus: true,
        });

        this.pIcon = new St.Icon({
            icon_name: powerIcon,
            x_align: Clutter.ActorAlign.CENTER,
        });
        this.pLabel = new St.Label({
            text: powerLabel,
            x_align: Clutter.ActorAlign.CENTER,
        });

        this.box = new St.BoxLayout({
            vertical: true,
        });
        this.box.add_child(this.pIcon);
        this.box.add_child(this.pLabel);
        this.set_child(this.box);

        this.connect('clicked', () => SystemActions.getDefault().activateAction(action) );
    }
});

const PowerMenu = GObject.registerClass(
class PowerMenu extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Power Menu'), false);

        this.add_child(new St.Icon({
            icon_name: 'system-shutdown-symbolic',
            style_class: 'system-status-icon',
        }));
        this.menu.actor.height = Main.layoutManager.primaryMonitor.height;
        this.menu.box.x_align = Clutter.ActorAlign.END;
        this.menu.box.y_align = Clutter.ActorAlign.CENTER;
        this.menu.box.style_class = 'pm-container popup-menu-content';

        this.buttons = [
            new PowerButton('system-shutdown-symbolic', 'Shutdown', 'power-off'),
            new PowerButton('system-reboot-symbolic', 'Restart', 'restart'),
            new PowerButton('system-lock-screen-symbolic', 'Lock', 'lock-screen'),
            new PowerButton('system-log-out-symbolic', 'Log Out', 'logout'),
            new PowerButton('moon-symbolic', 'Suspend', 'suspend'),
        ];

        this.buttons.forEach(btn => {
            this.menu.box.add_child(btn);
        });
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        this.stockSystemMenu = Main.panel.statusArea.aggregateMenu._system.menu.box;
    }
    enable() {
        this.stockSystemMenu.hide();
        this._panelButton = new PowerMenu();
        Main.panel.addToStatusArea(this._uuid, this._panelButton, 10, 'right');
    }
    disable() {
        this.stockSystemMenu.show();
        this._panelButton.destroy();
        this._panelButton = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}