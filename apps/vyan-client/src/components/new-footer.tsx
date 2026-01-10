"use client";
import React from "react";
import { Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

export default function NewFooter() {
    return (
        <footer className="bg-[#1A1A1A] text-white pt-16 pb-8">
            <div className="max-w-8xl mx-auto px-20">
                {/* Top Section */}
                <div className="flex flex-col lg:flex-row justify-between mb-16 gap-12">
                    {/* Brand & Socials */}
                    <div className="lg:w-1/3">
                        <div className="mb-8 relative h-16 w-48">
                            <img
                                src="/home/Logo.png"
                                alt="Shewell"
                                className="h-full w-full object-contain brightness-0 invert"
                            />
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                <div className="bg-white text-black p-2 rounded-full">
                                    <Twitter size={18} />
                                </div>
                                <span className="text-sm">Quick links</span>
                            </a>
                            <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                <div className="bg-white text-black p-2 rounded-full">
                                    <Instagram size={18} />
                                </div>
                                <span className="text-sm">Quick links</span>
                            </a>
                            <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                <div className="bg-white text-black p-2 rounded-full">
                                    <Linkedin size={18} />
                                </div>
                                <span className="text-sm">Quick links</span>
                            </a>
                            <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                <div className="bg-white text-black p-2 rounded-full">
                                    <Youtube size={18} />
                                </div>
                                <span className="text-sm">Quick links</span>
                            </a>
                        </div>
                    </div>

                    {/* Subscription Form */}
                    <div className="lg:w-1/2">
                        <h3 className="text-2xl font-light mb-8">
                            Subscribe For the latest updates
                        </h3>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-2">First name *</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#2A2A2A] text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#167D71] border border-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-2">Email *</label>
                                <input
                                    type="email"
                                    className="w-full bg-[#2A2A2A] text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#167D71] border border-gray-700"
                                />
                            </div>
                            <button className="bg-[#167D71] text-white px-8 py-3 rounded-md font-medium hover:bg-[#12685E] transition-colors mt-2">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 border-t border-gray-800 pt-16">
                    {/* Quick Links */}
                    <div>
                        <h4 className="text-2xl font-light mb-6">Quick links</h4>
                        <ul className="space-y-4 text-gray-300">
                            <li><a href="#" className="hover:text-[#167D71] transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-[#167D71] transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-[#167D71] transition-colors">Recipe</a></li>
                            <li><a href="#" className="hover:text-[#167D71] transition-colors">Reviews</a></li>
                        </ul>
                    </div>

                    {/* Counselling */}
                    <div>
                        <h4 className="text-2xl font-light mb-6">Counselling</h4>
                        <ul className="space-y-4 text-gray-300">
                            <li><a href="#" className="hover:text-[#167D71] transition-colors">Phycology</a></li>
                            <li><a href="#" className="hover:text-[#167D71] transition-colors">Nutritious</a></li>
                            <li><a href="#" className="hover:text-[#167D71] transition-colors">Mental Health</a></li>
                            <li><a href="#" className="hover:text-[#167D71] transition-colors">New Born Child</a></li>
                        </ul>
                    </div>

                    {/* Service */}
                    <div>
                        <h4 className="text-2xl font-light mb-6">Service</h4>
                        <ul className="space-y-4 text-gray-300">
                            <li><a href="#" className="hover:text-[#167D71] transition-colors">Pregnancies</a></li>
                            <li><a href="#" className="hover:text-[#167D71] transition-colors">Child Health</a></li>
                            <li><a href="#" className="hover:text-[#167D71] transition-colors">Prenatal</a></li>
                            <li><a href="#" className="hover:text-[#167D71] transition-colors">Postnatal</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-2xl font-light mb-6">Contact</h4>
                        <ul className="space-y-4 text-gray-300">
                            <li>123 colony Gurgram, Haryana- 122001</li>
                            <li>abcdvyan@gmail.com</li>
                            <li>+91-1234567890</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 border-t border-gray-800 pt-8">
                    <div className="flex gap-8 mb-4 md:mb-0">
                        <a href="#" className="hover:text-white">Terms & Conditions</a>
                        <a href="#" className="hover:text-white">Privacy Polices</a>
                    </div>
                    <div className="mb-4 md:mb-0">
                        2023, All Rights Reserved
                    </div>
                    <div>
                        Designed By <span className="text-[#167D71]">Thebrandopedia</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
