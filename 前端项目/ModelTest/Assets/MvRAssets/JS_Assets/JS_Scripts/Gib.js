/*This script handles gibs, making them detach from a paretn object, and get thrown away, afterwhich they explode.*/

#pragma strict

//Caching the transform for quicker access
private var thisTransform:Transform;

//Speed at which a gib is thrown
var verticalSpeed:float;
var horizontalSpeed:float;

//How quickly it rotates
var spin:float = 10;

//The gravity which pulls a gib down
var gravity:float = 10;

//The lane in which the parent objet is
var lane:Transform;

//How many seconds to wait before detroying the gib
var destroyAfter:float = 2;

//The effect to be created when destroying this object
var destroyEffect:Transform;

function Start() 
{
	thisTransform = transform; //Caching transform for quicker access
	
	//Set the horizontal speed randomly within the limits
	horizontalSpeed = Random.Range( -horizontalSpeed, horizontalSpeed);
	
	if ( destroyAfter <= 0 )
    {
    	//Create an effect on destroy
    	Instantiate( destroyEffect, thisTransform.position, Quaternion.identity);
    	
    	Destroy( thisTransform.gameObject);
    }
}

function Update() 
{
    //Change the gib's vertical speed
    verticalSpeed += gravity * Time.deltaTime;
    
    if ( lane )
    {
    	//Make the gib fall, but not further than the lane it's in
    	if ( thisTransform.position.x < lane.position.x )
	    {
		    thisTransform.Translate( Vector3.right * verticalSpeed * Time.deltaTime, Space.World);
		    thisTransform.Translate( Vector3.forward * horizontalSpeed * Time.deltaTime, Space.World);
			
		    thisTransform.Rotate( Vector3.up * spin * horizontalSpeed * Time.deltaTime, Space.World);
		}
		else if ( thisTransform.position.x != lane.position.x )
		{
			thisTransform.position.x = lane.position.x;
		}
    }
    else //If the gib has no lane, allow it to fall all the way down
    {
        thisTransform.Translate( Vector3.right * verticalSpeed * Time.deltaTime, Space.World);
		thisTransform.Translate( Vector3.forward * horizontalSpeed * Time.deltaTime, Space.World);
			
		thisTransform.Rotate( Vector3.up * spin * horizontalSpeed * Time.deltaTime, Space.World);
    }
    
    destroyAfter -= Time.deltaTime;
    
    if ( destroyAfter <= 0 )
    {
    	//Create an effect on destroy
    	Instantiate( destroyEffect, thisTransform.position, Quaternion.identity);
    	
    	Destroy( thisTransform.gameObject);
    }
}