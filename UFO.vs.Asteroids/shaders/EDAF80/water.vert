#version 410


layout (location = 0) in vec3 vertex;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 vTexCoord;
layout (location = 3) in vec3 t;
layout (location = 4) in vec3 b;

uniform mat4 vertex_model_to_world; 
uniform mat4 vertex_world_to_clip;
uniform sampler2D normal_map;
uniform float ellapsed_time_s;
 

out VS_OUT {
	vec3 vertex;
	vec3 normal;
 	vec3 t;
	vec3 b;
	vec2 texCoord;
} vs_out;

float wave(vec2 position, vec2 direction, float amplitude, float frequency,
		   float phase, float sharpness, float time)
{
				/* y = G(x,z,t) = A(sin((Dx * x + Dz * z) * f + tp) * 0.5 + 0.5)^k 
				 wave equation: A = amplitude, D = (Dx, Dz) = direction of travel
				   f = frequency, p = phase, k = sharpness, t = time,
				   (x,z) = position on plane of water surface */
				
	return amplitude * pow(sin(dot(position,direction)
								   * frequency + time * phase) * 0.5 + 0.5, sharpness);
}
/* Computes the derivative of two waves (NOTE: direction not included at end of expression, it is added individually for simplicity) */
float dWave(vec2 position, vec2 direction, float amplitude, float frequency,
		   float phase, float sharpness, float time)
{
	return 0.5 * sharpness * frequency * amplitude * (pow(sin(dot(direction, position) * frequency + time * phase)
		 * 0.5 + 0.5, sharpness - 1)) * cos(dot(direction, position) * frequency + time * phase); 
}

void main()
{
 

	/* Wave 1 attributes */
	float amplitude_w1 = 1.0;
	float frequency_w1 = 0.2;
	float phase_w1 = 0.5;
	float sharpness_w1 = 2.0;
	vec2 direction_w1 = vec2(-1.0, 0.0);

	/* Wave 2 attributes */
	float amplitude_w2 = 0.5;
	float frequency_w2 = 0.4;
	float phase_w2 = 1.3;
	float sharpness_w2 = 2.0;
	vec2 direction_w2 = vec2(-0.7, 0.7);
  
	vec3 displaced_vertex = vertex;
	displaced_vertex.y += wave(vertex.xz, direction_w1, amplitude_w1, frequency_w1,
		   phase_w1, sharpness_w1, ellapsed_time_s);
	displaced_vertex.y += wave(vertex.xz, direction_w2, amplitude_w2, frequency_w2,
		   phase_w2, sharpness_w2, ellapsed_time_s);

	float dHdx = 0.0f;
	float dHdz = 0.0f;

	dHdx = dWave(vertex.xz, direction_w1, amplitude_w1, frequency_w1, phase_w1, sharpness_w1, ellapsed_time_s) * direction_w1.x +
			dWave(vertex.xz, direction_w2, amplitude_w2, frequency_w2, phase_w2, sharpness_w2, ellapsed_time_s) * direction_w2.x;
    dHdz = dWave(vertex.xz, direction_w1, amplitude_w1, frequency_w1, phase_w1, sharpness_w1, ellapsed_time_s) * direction_w1.x +
			dWave(vertex.xz, direction_w2, amplitude_w2, frequency_w2, phase_w2, sharpness_w2, ellapsed_time_s) * direction_w2.x;

	vs_out.t = vec3(1, dHdx, 0);
	vs_out.b = vec3(0, dHdz, 1);
	vs_out.texCoord = vTexCoord.xy;
	//transform to world
	vs_out.vertex = vec3(vertex_model_to_world * vec4(displaced_vertex, 1.0)); 
	//vs_out.normal = vec3(vertex_model_to_world * vec4(normal, 0.0));
	vs_out.normal = vec3(-dHdx, 1.0f, -dHdz);
	gl_Position = vertex_world_to_clip * vertex_model_to_world * vec4(displaced_vertex, 1.0);
}
