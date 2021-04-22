/*This script handles the money pick up. If the mouse moves over it, it's removed and added to the player's money*/

#pragma strict

//Caching the transform for quicker access
private var thisTransform:Transform;

//The name of this resource type
var resourceName:String;

//The money value of this pickup
var money:int = 50;

//Did we pick up the money?
internal var pickedUp:boolean = false;

//The dropoff point of the money
var dropoff:Transform;

//How long to wait before removing the money
var removeAfter:float = 8;

//The sound when picking up the money
var soundPickup:AudioClip;

//Icons for this resource types
var iconSmall:Texture2D;
var iconBig:Texture2D;

//The text color for this resource when displaying its name or value
var textColor:Color = Color.yellow;

function Start() 
{
	thisTransform = transform; //Caching transform for quicker access
	
	Destroy(thisTransform.gameObject, removeAfter);
}

function Update() 
{
    removeAfter -= Time.deltaTime;
    
    if ( removeAfter <= 2 )
    {
    	//If there are less than 2 seconds left for pickup, make the money object blink
    	if ( Mathf.Round(removeAfter * 20) % 2 )
    	{
		    for ( child in thisTransform ) 
		    {
		    	(child as Transform).renderer.enabled = false;
		    }
    	}
    	else
    	{
    		for ( child in thisTransform ) 
		    {
		    	(child as Transform).renderer.enabled = true;
		    }
    	}
    }
	
	//Picking up the money
	if ( pickedUp == true )
	{
		//if ( soundPickup )    audio.PlayOneShot(soundPickup);
		
		//Move the money towards the drop off point
		thisTransform.position = Vector3.Slerp( thisTransform.position, dropoff.position, Time.deltaTime * 10);
		
		//And then remove the money object
		if ( Vector3.Distance(thisTransform.position, dropoff.position) < 0.5 )
		{
			Destroy(thisTransform.gameObject);
		}
	}
}