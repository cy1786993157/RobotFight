import { ui } from "../ui/layaMaxUI";

export default class MainView extends ui.view.MianViewUI
{

    private scene3D:Laya.Scene3D;
   constructor()
   {
       super();
   }

   onEnable()
   {
       //加载3D资源
          Laya.loader.create("scene/Conventional/scene_0.ls",Laya.Handler.create(this,this.onPress),null)
   }

   onPress()
   {
    this.scene3D=  Laya.loader.getRes("scene/Conventional/scene_0.ls");
    this.addChild(this.scene3D);
   }

   onDisable()
   {

   }

}