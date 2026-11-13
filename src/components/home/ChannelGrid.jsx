import React from 'react';
import { ArrowRight, MessageSquare, Bot } from 'lucide-react';
import { ChannelIcon } from '../common/ChannelIcon';
import { CHANNELS_INFO } from '../../data/scenarios';
import { analytics } from '../../services/analytics';

const CHANNEL_ORDER = ['facebook', 'whatsapp', 'youtube', 'instagram', 'tiktok', 'website'];
const COMING_SOON_CHANNELS = new Set(['instagram', 'tiktok', 'website']);

export function ChannelGrid({ onNavigate }) {
  const channels = [...CHANNELS_INFO].sort(
    (first, second) => CHANNEL_ORDER.indexOf(first.id) - CHANNEL_ORDER.indexOf(second.id),
  );

  return (
    <section id="channels-section" className="py-20 bg-white border-b border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider">
            <span>Multi-Channel Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            One Intelligence. Every Channel.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            LeadHive AI unifies incoming conversations across major social and direct customer touchpoints, applying unified qualification and prioritization without fragmentation.
          </p>
        </div>

        {/* 6-Channel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {channels.map((ch) => {
            const isComingSoon = COMING_SOON_CHANNELS.has(ch.id);

            return (
              <div
                key={ch.id}
                className={`group relative rounded-2xl border p-6 transition-all flex flex-col justify-between ${
                  isComingSoon
                    ? 'border-slate-200 bg-slate-50 shadow-none'
                    : 'border-slate-200 bg-white shadow-subtle hover:border-brand-300 hover:shadow-card'
                }`}
              >
                <div className={isComingSoon ? 'opacity-55 grayscale' : ''}>
                  {/* Card Header */}
                  <div className="flex items-center pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <ChannelIcon channel={ch.id} className="w-10 h-10 rounded-xl" />
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{ch.name}</h3>
                        <p className="text-xs text-slate-500">{ch.interactionType}</p>
                      </div>
                    </div>
                  </div>

                  {/* Channel Description */}
                  <p className="text-sm font-medium text-slate-700 mt-4 leading-normal">
                    {ch.description}
                  </p>

                  {/* Illustrative Conversation Preview Card */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-slate-400" />
                        Inbound Preview
                      </span>
                      <span className="italic text-[10px]">Simulated activity</span>
                    </div>
                    <p className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-100 shadow-xs leading-relaxed">
                      "{ch.previewText}"
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-brand-700 font-medium pt-0.5">
                      <Bot className="w-3.5 h-3.5 text-brand-500" />
                      <span>LeadHive extracts intent & validates budget</span>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {isComingSoon ? (
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                      Coming Soon
                    </span>
                  ) : (
                    <>
                      <span className="text-xs text-slate-500">Supported Workflow</span>
                      <button
                        onClick={() => {
                          analytics.track('conversation_selected', { channel: ch.id, source: 'channel_grid' });
                          onNavigate(
                            ['facebook', 'whatsapp', 'youtube'].includes(ch.id) ? 'dashboard' : 'experience',
                            ch.id,
                          );
                        }}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        Test in Sandbox
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
