//A simple script to rotate an object at a certain speed

#pragma strict

private var thisTransform:Transform;
var rotateSpeed:float = 2;

function Start() 
{
	thisTransform = this.transform;
}

function Update() 
{
	thisTransform.eulerAngles.y += rotateSpeed * Time.deltaTime;
}