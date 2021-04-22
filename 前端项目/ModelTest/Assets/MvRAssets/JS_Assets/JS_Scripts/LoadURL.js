#pragma strict

var URL:String = "https://www.assetstore.unity3d.com/#/publisher/4255";

function Activate()
{
	Application.OpenURL(URL);
	
	Application.ExternalEval("window.open('http://your site.com','Window title')");
}
