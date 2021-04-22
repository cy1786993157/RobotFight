//This script shakes an object when it runs, with values for strength and time. You can set which object to shake, and if you keep the object value empty it 
//will shake the object it's attached to.

#pragma strict

//Caching the transform for quicker access
private var thisTransform:Transform;

//The original position of the camera
private var originPos:Vector3;

//How violently to shake the camera
var strength:Vector3;

//How quickly to settle down from shaking
var decay:float = 0.8;

//How many seconds to shake
var _shakeTime:float = 2;

function Start() 
{
	thisTransform = transform; //Caching transform for quicker access
	
	//Record the original position of the camera
	originPos = Camera.main.transform.position;
}

function Update() 
{
	if ( _shakeTime > 0 )
	{
		_shakeTime -= Time.deltaTime;
		
		//Move the camera in all directions based on strength
		Camera.main.transform.position.x = originPos.x + Random.Range(-strength.x, strength.x);
		Camera.main.transform.position.y = originPos.y + Random.Range(-strength.y, strength.y);
		Camera.main.transform.position.z = originPos.z + Random.Range(-strength.z, strength.z);
		
		//Gradually reduce the strength value
		strength *= decay;
	}
	else if ( Camera.main.transform.position != originPos )
	{
		//Reset the camera position
		Camera.main.transform.position = originPos;
	}
}