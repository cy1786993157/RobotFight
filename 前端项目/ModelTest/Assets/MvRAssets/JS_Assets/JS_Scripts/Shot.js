/*This script contains the attributes of a shot, and handles the behaviour and interaction of each one with its targets. You can set speed, damage, pushback etc
You can also set wether this shot chases the enemy and how fast it rotates. You can also set the shot start and hit effect, as well as a sticky which attaches
itself to the target when hit*/

#pragma strict

//Caching the transform for quicker access
private var thisTransform:Transform;

//Basic attributes
var speed:float = 10;
var damage:float = 5;
var pushBack:float = -1;

//Remove the shot after a few seconds
var removeAfter:float = 3;

//The (muzzle) effect created at the start of this shot's life
var effect:Transform;

//A homing shot chases the nearest enemy, rotating at a set speed
var homing:boolean = false;
var rotateSpeed:float = 10;
var homingTarget:Transform;

//values for internal use
private var lookRotation:Quaternion;
private var direction:Vector3;

//Look directly at the enemy when created
var lookAtEnemy:boolean = false;

//The sticky object created when this shot hits an enemy
var sticky:Transform;

var hitEffect:Transform;

//A list of valid targets for the shot
var validTargets:LayerMask;

//Should this shot die on collision with the target?
var dieOnHit:boolean = true;

function Start() 
{
	thisTransform = transform; //Caching transform for quicker access
	
	//Remove the object after a few seconds
	if ( removeAfter > 0 )    Destroy(gameObject, removeAfter);
	
	//Create a shot (muzzle) effect
	if ( effect )    Instantiate( effect, thisTransform.position, thisTransform.rotation);
	
	//If this is a homing shot, make it look for the nearest target, and then rotate towards it
	if ( homing )
	{
		if ( homingTarget )
		{
			//Look directly at the enemy
			if ( lookAtEnemy == true )   thisTransform.LookAt(homingTarget);
			
			//if this shot has a line renderer, stretch it to the target. It's an instant hit.
			if ( GetComponent(LineRenderer) )
			{
				//Stretch the line between this transform and the target
				GetComponent(LineRenderer).SetPosition(1, Vector3(0,0, Vector3.Distance(thisTransform.position, homingTarget.position)));
				
				//Remove from the target enemy's health
				if ( homingTarget.GetComponent(Enemy) )    homingTarget.GetComponent(Enemy).health -= damage;
				
				//If the target has a ChangeAttribute script, remove from its health counter too
				if ( homingTarget.GetComponent(ChangeAttribute) )    homingTarget.GetComponent(ChangeAttribute).healthLossCount += damage;
				
				//If there is a hit effect, create it at the hit position
    			if ( hitEffect )    
    			{
    				var newShot:Transform = Instantiate( hitEffect, homingTarget.position, Quaternion.identity);
    				
    				if ( newShot.GetComponent(Shot) )    newShot.GetComponent(Shot).validTargets = validTargets;
    			}
    			
    			//Destroy this script
				Destroy(this);
			}
		}
	}
}

function Update() 
{
	//Move the object forward based on speed
	thisTransform.Translate(Vector3.forward * speed * Time.deltaTime);
	
	//If this is a homing shot, make it look for the nearest target, and then rotate towards it
	if ( homing )
	{
		if ( homingTarget )
		{
			//Find the direction we need to look in towards the target
			direction = ( homingTarget.position - thisTransform.position).normalized;
			 
			//Set the rotation towards the target
			lookRotation = Quaternion.LookRotation(direction);
			 
			//rotate towrads the target beased on rotateSpeed
			thisTransform.rotation = Quaternion.Slerp( thisTransform.rotation, lookRotation, Time.deltaTime * rotateSpeed);
		}
	}
}

function OnTriggerStay(target:Collider)
{
    //If this shot hits a valid target from the validTargets layer mask, do damage and effects
    if ( validTargets.value & 1<<target.collider.gameObject.layer )
    {
    	//Reduce from the target enemy's health
    	if ( target.GetComponent(Enemy) )    target.GetComponent(Enemy).health -= damage;
    	else if ( target.GetComponent(Building) )    target.GetComponent(Building).health -= damage;
    	
    	//Change color of hit object
    	//target.renderer.material.color = Color(0,0,0);
    	
    	target.renderer.material.SetColor("_MainColor", Color.red);
    	
    	//print(target.renderer.material.color);
    	
    	//
    	if ( target.GetComponent(ChangeAttribute) )    target.GetComponent(ChangeAttribute).healthLossCount += damage;
    	
    	target.transform.Translate(Vector3.forward * pushBack * Time.deltaTime, Space.World);
    	
    	if ( hitEffect )    
    	{
    		Instantiate( hitEffect, thisTransform.position, Quaternion.identity);
    	}
    	
    	//If the shot has a sticky object assigned, create it and attach it to the enemy. Make sure the enemy doesn't already have a sticky attached
    	if ( sticky && target.gameObject.GetComponent(Enemy).sticky == null )    
    	{
    		//Create a new sticky object
    		var newSticky:Transform = Instantiate( sticky, target.transform.position, Quaternion.identity);
    		
    		//Set the enemy as its stuck target
    		newSticky.GetComponent(Sticky).stuckTo = target.transform;
    		
    		//Set this sticky to the target enemy
    		target.gameObject.GetComponent(Enemy).sticky = newSticky;
    		
    		//Put it in the enemy
    		newSticky.transform.parent = target.transform;
    	}
    	
    	if ( dieOnHit == true )    Destroy(gameObject); //Remove this shot from the game
    }
}

