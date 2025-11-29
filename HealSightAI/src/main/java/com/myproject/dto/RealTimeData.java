package com.myproject.dto;

public class RealTimeData {
    private String city;
    private double temperatureC;
    private String condition;
    private int aqi;
    private Double pm25;
    private Double pm10;
	public String getCity() {
		return city;
	}
	
	public RealTimeData(String city, double temperatureC, String condition, int aqi, Double pm25, Double pm10) {
	    this.city = city;
	    this.temperatureC = temperatureC;
	    this.condition = condition;
	    this.aqi = aqi;
	    this.pm25 = pm25;
	    this.pm10 = pm10;
	}

	public void setCity(String city) {
		this.city = city;
	}
	public double getTemperatureC() {
		return temperatureC;
	}
	public void setTemperatureC(double temperatureC) {
		this.temperatureC = temperatureC;
	}
	public String getCondition() {
		return condition;
	}
	public void setCondition(String condition) {
		this.condition = condition;
	}
	public int getAqi() {
		return aqi;
	}
	public void setAqi(int aqi) {
		this.aqi = aqi;
	}
	public Double getPm25() {
		return pm25;
	}
	public void setPm25(Double pm25) {
		this.pm25 = pm25;
	}
	public Double getPm10() {
		return pm10;
	}
	public void setPm10(Double pm10) {
		this.pm10 = pm10;
	}
    
    
}
