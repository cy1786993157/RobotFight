//This script handles an object which gets attached to the target of a shot, when said shot hits the target. It can cause damage over tiem to the 
//target or even freeze it for a while. After a few seconds the sticky object is removed.

#pragma strict

//Caching the transform for quicker access
private var thisTransform:Transform;

//The object that this sticky-object is attached to
var stuckTo:Transform;

//How many seconds to wait before removing this sticky
var stickTime:float = 3;

//Cause damage over time to the target
var attackDelay:float = 1;
private var attackDelayCount:float = 0;
var damage:float = 1;

//freeze this target
var freeze:boolean = false;

function Start() 
{
	thisTransform = transform;
	
	//If freeze is set to true, stop animating this target, and stop its script if it's an enemy
	if ( freeze )    
	{
		thisTransform.parent.animation.Stop();
		
		if ( thisTransform.parent.GetComponent(Enemy) )    thisTransform.parent.GetComponent(Enemy).enabled = false;
	}
	
	//Wait for the sticky duration
	yield WaitForSeconds(stickTime);
	
	//Then unfreeze the target and run its previously frozen script
	if ( freeze )    
	{
		thisTransform.parent.animation.Play();
		
		thisTransform.parent.GetComponent(Enemy).enabled = true;
	}
	
	//Finally, destroy the sticky object
	Destroy(gameObject);
}

function Update() 
{
	//Count up towards the next attack
	attackDelayCount += Time.deltaTime;
	
	//Attack the target
	if ( attackDelayCount >= attackDelay )
	{
		attackDelayCount = 0;
		
		if ( stuckTo )    stuckTo.GetComponent(Enemy).health -= damage;
	}
}