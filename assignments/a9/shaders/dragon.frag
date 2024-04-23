#version 330 core

/*default camera matrices. do not modify.*/
layout(std140) uniform camera
{
    mat4 projection;	/*camera's projection matrix*/
    mat4 view;			/*camera's view matrix*/
    mat4 pvm;			/*camera's projection*view*model matrix*/
    mat4 ortho;			/*camera's ortho projection matrix*/
    vec4 position;		/*camera's position in world space*/
};

/* set light ubo. do not modify.*/
struct light
{
    ivec4 att;
    vec4 pos; // position
    vec4 dir;
    vec4 amb; // ambient intensity
    vec4 dif; // diffuse intensity
    vec4 spec; // specular intensity
    vec4 atten;
    vec4 r;
};
layout(std140) uniform lights
{
    vec4 amb;
    ivec4 lt_att; // lt_att[0] = number of lights
    light lt[4];
};

/*input variables*/
in vec3 vtx_normal; // vtx normal in world space
in vec3 vtx_position; // vtx position in world space
in vec3 vtx_model_position; // vtx position in model space
in vec4 vtx_color;
in vec2 vtx_uv;
in vec3 vtx_tangent;

uniform vec3 ka;            /* object material ambient */
uniform vec3 kd;            /* object material diffuse */
uniform vec3 ks;            /* object material specular */
uniform float shininess;    /* object material shininess */

uniform sampler2D tex_color;   /* texture sampler for color */
uniform sampler2D tex_normal;   /* texture sampler for color */

/*output variables*/
out vec4 frag_color;

vec4 shading_texture_with_color() 
{
    vec4 color = vec4(0.0);
    vec2 uv = vtx_uv;

    vec4 col = texture(tex_color, uv);

    return col;
}

vec3 shading_texture_with_phong(light li, vec3 e, vec3 p, vec3 s, vec3 n)
{
    vec4 color = vec4(0.0);
    vec3 texture_color = shading_texture_with_color().rgb;

    vec3 l = normalize(vec3(s.x - p.x, s.y - p.y, s.z - p.z)); // light vector
    vec3 r = normalize(reflect(-l, n)); // reflection vector
    vec3 v = normalize(vec3(e.x - p.x, e.y - p.y, e.z - p.z)); // eye vector

    vec3 amb = ka*lt[1].amb.xyz;
    vec3 lam = (kd*lt[1].dif.xyz)*(max(0, dot(l, n)))*texture_color;
    vec3 phong = (ks*lt[1].spec.xyz)*(pow((max(0, dot(v, r))), shininess));

    vec3 combo = amb + lam + phong;
    vec3 phong_color = combo;

    return phong_color;
}

vec3 calc_bitangent(vec3 N, vec3 T) 
{
    vec3 B = vec3(0.0);     //// the bitangent vector you need to calculate
    
    B = normalize(cross(N, T));
    
    return B;
}

mat3 calc_TBN_matrix(vec3 T, vec3 B, vec3 N) 
{
    mat3 TBN = mat3(0.0);   //// the TBN matrix you need to calculate

    TBN = mat3(T, B, N);

    return TBN;
}

vec3 read_normal_texture()
{
    vec3 normal = texture(tex_normal, vtx_uv).rgb;
    normal = normalize(normal * 2.0 - 1.0);
    return normal;
}

vec3 calc_perturbed_normal(mat3 TBN, vec3 normal) 
{
    vec3 perturbed_normal = vec3(0.0);

    perturbed_normal = normalize(TBN * normal);
    
    return perturbed_normal;
}

vec3 shading_texture_with_normal_mapping()
{
    vec3 e = position.xyz;              //// eye position
    vec3 p = vtx_position;              //// surface position

    vec3 N = normalize(vtx_normal);     //// normal vector
    vec3 T = normalize(vtx_tangent);    //// tangent vector

    vec3 perturbed_normal = vec3(0.0);  //// perturbed normal

    vec3 B = calc_bitangent(N, T);
    mat3 TBN = calc_TBN_matrix(T, B, N);
    vec3 normal_texture = read_normal_texture();
    perturbed_normal = calc_perturbed_normal(TBN, normal_texture);


    vec3 color = shading_texture_with_phong(lt[0], e, p, lt[0].pos.xyz, perturbed_normal)
               + shading_texture_with_phong(lt[1], e, p, lt[1].pos.xyz, perturbed_normal)
               + shading_texture_with_phong(lt[2], e, p, lt[2].pos.xyz, perturbed_normal)
               + shading_texture_with_phong(lt[3], e, p, lt[3].pos.xyz, perturbed_normal);
    return color;
}

void main()
{
    vec3 e = position.xyz;              //// eye position
    vec3 p = vtx_position;              //// surface position
    vec3 N = normalize(vtx_normal);     //// normal vector
    vec3 T = normalize(vtx_tangent);    //// tangent vector

    vec3 texture_normal = read_normal_texture();
    vec4 tex_color = texture(tex_color, vtx_uv);

    //frag_color = vec4(tex_color.rgb, 1.0);
    //vec4 tex_color = texture(tex_color, vtx_uv);

    /* This if statement discard a fragment if its alpha value is below a threshold (for alpha blending) */

    if(tex_color.a < 0.1)
    {
        discard;
    }

    frag_color = vec4(shading_texture_with_normal_mapping(), tex_color.a);
}