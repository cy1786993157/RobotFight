import { ui } from "../ui/layaMaxUI";

export default class MainView extends ui.scene.MianViewUI
{

   constructor()
   {
       super();
   }

   onEnable()
   {
       //加载3D资源
          Laya.loader.create("")
   }

   onDisable()
   {

   }

}