import * as React from 'react';
import './component.sass';
import { RigNav } from '../rig-nav';
import { ExtensionViewContainer } from '../extension-view-container';
import { Console } from '../console';
import { ExtensionViewDialog } from '../extension-view-dialog';
import { RigConfigurationsDialog } from '../rig-configurations-dialog';
import { EditViewDialog, EditViewProps } from '../edit-view-dialog';
import { ProductManagementViewContainer } from '../product-management-container';
import { createExtensionObject } from '../util/extension';
import { createSignedToken } from '../util/token';
import { fetchManifest, fetchExtensionManifest, fetchUserInfo } from '../util/api';
import { EXTENSION_VIEWS, BROADCASTER_CONFIG, LIVE_CONFIG, CONFIGURATIONS, PRODUCT_MANAGEMENT } from '../constants/nav-items'
import { ViewerTypes } from '../constants/viewer-types';
import { OverlaySizes } from '../constants/overlay-sizes';
import { IdentityOptions } from '../constants/identity-options';
import { MobileSizes } from '../constants/mobile';
import { RigRole } from '../constants/rig';
import { RigExtensionView, RigExtension } from '../core/models/rig';
import { Extension } from '../core/models/extension';
import { ExtensionManifest } from '../core/models/manifest';
import { UserSession } from '../core/models/user-session';
const { ExtensionMode, ExtensionViewType } = window['extension-coordinator'];

// TODO: wrap this in container

export interface ReduxDispatchProps {
  saveManifest: (manifest: ExtensionManifest) => void;
  userLogin: (userSession: UserSession) => void;
}

export interface RigProps { }

interface State {
  apiHost: string;
  clientId: string;
  secret: string;
  version: string;
  channelId: string;
  userName: string;
  mode: string;
  extensionViews: RigExtensionView[],
  manifest: ExtensionManifest;
  showExtensionsView: boolean;
  showConfigurations: boolean;
  showEditView: boolean;
  showProductManagementView: boolean;
  idToEdit: string;
  selectedView: string;
  extension: RigExtension;
  userId: string;
  error: string;
}

type Props = RigProps & ReduxDispatchProps;
export class RigComponent extends React.Component<Props, State> {
  public refs: {
    extensionViewDialog: ExtensionViewDialog;
  }

  public state: State = {
    apiHost: process.env.API_HOST || 'api.twitch.tv',
    clientId: process.env.EXT_CLIENT_ID,
    secret: process.env.EXT_SECRET,
    version: process.env.EXT_VERSION,
    channelId: process.env.EXT_CHANNEL_ID,
    userName: process.env.EXT_USER_NAME,
    mode: ExtensionMode.Viewer,
    extensionViews: [],
    manifest: {} as ExtensionManifest,
    showExtensionsView: false,
    showConfigurations: false,
    showEditView: false,
    showProductManagementView: false,
    idToEdit: '0',
    selectedView: EXTENSION_VIEWS,
    extension: {} as RigExtension,
    userId: '',
    error: '',
  }

  public componentDidMount() {
    this.fetchInitialConfiguration();
  }

  public componentWillMount() {
    this.initLocalStorage();
    this.setLogin();
  }

  public openConfigurationsHandler = () => {
    this.setState({
      showConfigurations: true,
      selectedView: CONFIGURATIONS
    });
  }

  public closeConfigurationsHandler = () => {
    this.setState({
      showConfigurations: false,
    });
  }

  public openEditViewHandler = (id:string) => {
    this.setState({
      showEditView: true,
      idToEdit: id,
    });
  }

  public closeEditViewHandler = () => {
    this.setState({
      showEditView: false,
      idToEdit: '0',
    });
  }

  public viewerHandler = () => {
    this.setState({
      mode: ExtensionMode.Viewer,
      selectedView: EXTENSION_VIEWS,
      extension: {} as Extension,
    });
  }

  public configHandler = () => {
    this.setState({
      mode: ExtensionMode.Config,
      selectedView: BROADCASTER_CONFIG,
      extension: createExtensionObject(
        this.state.manifest,
        '0',
        ViewerTypes.Broadcaster,
        true,
        this.state.userName,
        this.state.channelId,
        this.state.secret,
        ''),
    });
  }

  public liveConfigHandler = () => {
    this.setState({
      mode: ExtensionMode.Dashboard,
      selectedView: LIVE_CONFIG,

      extension: createExtensionObject(
        this.state.manifest,
        '0',
        ViewerTypes.Broadcaster,
        true,
        this.state.userName,
        this.state.channelId,
        this.state.secret,
        ''),
    });
  }

  private openProductManagementHandler = () => {
    this.setState({
      selectedView: PRODUCT_MANAGEMENT,
    });
  }

  public openExtensionViewHandler = () => {
    if (this.state.error === '') {
      this.setState({
        showExtensionsView: true,
      });
    }
  }

  public closeExtensionViewDialog = () => {
    this.setState({
      showExtensionsView: false
    });
  }

  private refreshConfigurationsHandler = () => {
    const token = createSignedToken(RigRole, '', this.state.userId, this.state.channelId, this.state.secret);
    fetchExtensionManifest(this.state.apiHost, this.state.clientId, this.state.version, token)
      .then(this.onConfigurationSuccess)
      .catch(this.onConfigurationError);
  }

  public onConfigurationSuccess = (data: any) => {
    this.props.saveManifest(data.manifest);
    this.setState(data);
  }

  public onConfigurationError = (errMsg: string) => {
    this.setState({
      error: errMsg,
    });
  }

  public getFrameSizeFromDialog(dialogRef: any) {
    if (dialogRef.state.frameSize === 'Custom') {
      return {
        width: dialogRef.state.width,
        height: dialogRef.state.height
      };
    }
    if (dialogRef.state.extensionViewType === ExtensionViewType.Mobile) {
      return MobileSizes[dialogRef.state.frameSize];
    }

    return OverlaySizes[dialogRef.state.frameSize];
  }

  public createExtensionView = () => {
    const extensionViews = this.getExtensionViews();
    const linked = this.refs.extensionViewDialog.state.identityOption === IdentityOptions.Linked;
    extensionViews.push({
      id: (extensionViews.length + 1).toString(),
      type: this.refs.extensionViewDialog.state.extensionViewType,
      extension: createExtensionObject(
        this.state.manifest,
        (extensionViews.length + 1).toString(),
        this.refs.extensionViewDialog.state.viewerType,
        linked,
        this.state.userName,
        this.state.channelId,
        this.state.secret,
        this.refs.extensionViewDialog.state.opaqueId,
      ),
      linked: linked,
      role: this.refs.extensionViewDialog.state.viewerType,
      x: this.refs.extensionViewDialog.state.x,
      y: this.refs.extensionViewDialog.state.y,
      orientation: this.refs.extensionViewDialog.state.orientation,
      frameSize: this.getFrameSizeFromDialog(this.refs.extensionViewDialog),
    });
    this.pushExtensionViews(extensionViews);
    this.closeExtensionViewDialog();
  }

  public deleteExtensionView = (id:string) => {
    this.pushExtensionViews(this.state.extensionViews.filter(element => element.id !== id));
  }

  public editViewHandler = (newViewState: EditViewProps) => {
    const views = this.getExtensionViews();
    views.forEach((element: RigExtensionView)=> {
      if (element.id === this.state.idToEdit) {
        element.x = newViewState.x;
        element.y = newViewState.y;
        element.orientation = newViewState.orientation;
      }
    });
    this.pushExtensionViews(views);
    this.closeEditViewHandler();
  }

  public render() {
    let view = (
      <div>
        <ExtensionViewContainer
          mode={this.state.mode}
          extensionViews={this.state.extensionViews}
          deleteExtensionViewHandler={this.deleteExtensionView}
          openExtensionViewHandler={this.openExtensionViewHandler}
          openEditViewHandler={this.openEditViewHandler}
          extension={this.state.extension} />
        {this.state.showExtensionsView &&
          <ExtensionViewDialog
            ref="extensionViewDialog"
            extensionViews={this.state.manifest.views}
            show={this.state.showExtensionsView}
            closeHandler={this.closeExtensionViewDialog}
            saveHandler={this.createExtensionView} />}
        {this.state.showEditView &&
          <EditViewDialog
            idToEdit={this.state.idToEdit}
            show={this.state.showEditView}
            views={this.getExtensionViews()}
            closeHandler={this.closeEditViewHandler}
            saveViewHandler={this.editViewHandler}
          />}
        <RigConfigurationsDialog
          show={this.state.showConfigurations}
          config={this.state.manifest}
          closeConfigurationsHandler={this.closeConfigurationsHandler}
          refreshConfigurationsHandler={this.refreshConfigurationsHandler} />
        <Console />
      </div>
    );

    if (this.state.selectedView === PRODUCT_MANAGEMENT) {
      view = (
        <ProductManagementViewContainer clientId={this.state.clientId} />
      );
    }

    return (
      <div className="rig-container">
        <RigNav
          selectedView={this.state.selectedView}
          viewerHandler={this.viewerHandler}
          configHandler={this.configHandler}
          liveConfigHandler={this.liveConfigHandler}
          openConfigurationsHandler={this.openConfigurationsHandler}
          openProductManagementHandler={this.openProductManagementHandler}
          error={this.state.error}/>
        {view}
      </div>
    );
  }

  public getExtensionViews() {
    const extensionViewsValue = localStorage.getItem("extensionViews");
    return extensionViewsValue ? JSON.parse(extensionViewsValue) : extensionViewsValue;
  }

  public pushExtensionViews(newViews: RigExtensionView[]) {
    localStorage.setItem("extensionViews", JSON.stringify(newViews));
    this.setState({
      extensionViews: newViews,
    });
  }

  private fetchInitialConfiguration() {
    if (this.state.userName) {
      fetchManifest(
        this.state.apiHost,
        this.state.clientId,
        this.state.userName,
        this.state.version,
        this.state.channelId,
        this.state.secret
      )
      .then(this.onConfigurationSuccess)
      .catch(this.onConfigurationError);
    }
  }

  private initLocalStorage() {
    const extensionViewsValue = localStorage.getItem("extensionViews");
    if (!extensionViewsValue) {
      localStorage.setItem("extensionViews", JSON.stringify([]));
      return;
    }
    this.setState({
      extensionViews: JSON.parse(extensionViewsValue)
    })
  }

  private setLogin() {
    const windowHash = window.location.hash;
    const rigLogin = localStorage.getItem('rigLogin');
    if (windowHash.includes('access_token')) {
      const accessTokenKey = 'access_token=';
      const accessTokenIndex = windowHash.indexOf(accessTokenKey);
      const ampersandIndex = windowHash.indexOf('&');
      const accessToken = windowHash.substring(accessTokenIndex + accessTokenKey.length, ampersandIndex);
      fetchUserInfo('api.twitch.tv', accessToken)
        .then(resp => {
          const userSess = {
            login: resp.login,
            authToken: accessToken,
            profileImageUrl: resp.profile_image_url,
          }
          this.setState({
            userName: resp.login,
          });
          this.props.userLogin(userSess);
          localStorage.setItem('rigLogin', JSON.stringify(userSess));
          window.location.assign('/');
        })
        .catch(err => {
          this.setState({
            error: err,
          });
        });
    }
    else if (rigLogin) {
      const login = JSON.parse(rigLogin);
      this.setState({
        userName: login.login,
      })
      this.props.userLogin({
        login: login.login,
        authToken: login.authToken,
        profileImageUrl: login.profileImageUrl,
      });
    }
  }
}
